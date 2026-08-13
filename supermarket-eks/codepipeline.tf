# ============================================================
# CODESTAR CONNECTION — GitHub (OAuth v2)
# NOTE: After apply, you must manually ACTIVATE this connection
#       in the AWS Console → Developer Tools → Connections
# ============================================================
resource "aws_codestarconnections_connection" "github" {
  name          = "${var.project_name}-github-connection"
  provider_type = "GitHub"

  tags = {
    Name = "${var.project_name}-github-connection"
  }
}

# ============================================================
# CODEBUILD — Build Stage (Docker build + ECR push)
# ============================================================
resource "aws_codebuild_project" "build" {
  name          = "${var.project_name}-build"
  description   = "Builds Docker image and pushes to Amazon ECR"
  service_role  = aws_iam_role.codebuild_role.arn
  build_timeout = "20"

  artifacts {
    type = "CODEPIPELINE"
  }

  cache {
    type = "NO_CACHE"
  }

  environment {
    compute_type                = "BUILD_GENERAL1_SMALL"
    image                       = "aws/codebuild/amazonlinux2-x86_64-standard:5.0"
    type                        = "LINUX_CONTAINER"
    privileged_mode             = true   # Required for Docker-in-Docker

    environment_variable {
      name  = "AWS_REGION"
      value = var.aws_region
    }

    environment_variable {
      name  = "ECR_REPOSITORY"
      value = var.ecr_repository_name
    }

    environment_variable {
      name  = "EKS_CLUSTER_NAME"
      value = aws_eks_cluster.main.name
    }

    environment_variable {
      name  = "K8S_NAMESPACE"
      value = var.k8s_namespace
    }

    environment_variable {
      name  = "APP_REPLICAS"
      value = tostring(var.app_replicas)
    }
  }

  source {
    type      = "CODEPIPELINE"
    buildspec = "buildspec.yml"
  }

  logs_config {
    cloudwatch_logs {
      group_name  = "/codebuild/${var.project_name}-build"
      stream_name = "build-log"
    }
  }

  tags = {
    Name = "${var.project_name}-codebuild"
  }
}

resource "aws_cloudwatch_log_group" "codebuild_logs" {
  name              = "/codebuild/${var.project_name}-build"
  retention_in_days = 7
}

# ============================================================
# CODEPIPELINE — Source → Build (includes EKS deploy in buildspec)
# ============================================================
resource "aws_codepipeline" "pipeline" {
  name     = "${var.project_name}-pipeline"
  role_arn = aws_iam_role.codepipeline_role.arn

  artifact_store {
    location = aws_s3_bucket.pipeline_artifacts.bucket
    type     = "S3"
  }

  # Stage 1: Pull source from GitHub via CodeStar Connection
  stage {
    name = "Source"

    action {
      name             = "GitHub_Source"
      category         = "Source"
      owner            = "AWS"
      provider         = "CodeStarSourceConnection"
      version          = "1"
      output_artifacts = ["source_output"]
      run_order        = 1

      configuration = {
        FullRepositoryId     = "${var.github_repo_owner}/${var.github_repo_name}"
        BranchName           = var.github_branch
        ConnectionArn        = aws_codestarconnections_connection.github.arn
        OutputArtifactFormat = "CODE_ZIP"
      }
    }
  }

  # Stage 2: Build Docker image, push to ECR, deploy to EKS (kubectl in buildspec)
  stage {
    name = "Build_and_Deploy"

    action {
      name             = "Build_Push_Deploy"
      category         = "Build"
      owner            = "AWS"
      provider         = "CodeBuild"
      input_artifacts  = ["source_output"]
      output_artifacts = ["build_output"]
      version          = "1"
      run_order        = 1

      configuration = {
        ProjectName = aws_codebuild_project.build.name
      }
    }
  }

  tags = {
    Name = "${var.project_name}-pipeline"
  }
}
