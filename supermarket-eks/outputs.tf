# ============================================================
# EKS CLUSTER OUTPUTS
# ============================================================

output "eks_cluster_name" {
  description = "EKS cluster name"
  value       = aws_eks_cluster.main.name
}

output "eks_cluster_endpoint" {
  description = "EKS cluster API server endpoint"
  value       = aws_eks_cluster.main.endpoint
}

output "eks_cluster_version" {
  description = "Kubernetes version running on the cluster"
  value       = aws_eks_cluster.main.version
}

output "eks_kubeconfig_command" {
  description = "Run this command to update your local kubeconfig"
  value       = "aws eks update-kubeconfig --name ${aws_eks_cluster.main.name} --region ${var.aws_region}"
}

output "eks_node_group_arn" {
  description = "EKS managed node group ARN"
  value       = aws_eks_node_group.main.arn
}

# ============================================================
# ECR OUTPUT
# ============================================================

output "ecr_repository_url" {
  description = "ECR repository URL for pushing Docker images"
  value       = aws_ecr_repository.app.repository_url
}

# ============================================================
# RDS OUTPUT
# ============================================================

output "rds_endpoint" {
  description = "RDS MySQL connection endpoint (use in ConfigMap DB_HOST)"
  value       = aws_db_instance.mysql.address
}

output "rds_port" {
  description = "RDS MySQL port"
  value       = aws_db_instance.mysql.port
}

# ============================================================
# DYNAMODB OUTPUTS
# ============================================================

output "dynamodb_cart_table_name" {
  description = "DynamoDB cart table name"
  value       = aws_dynamodb_table.cart.name
}

output "dynamodb_logs_table_name" {
  description = "DynamoDB logs table name"
  value       = aws_dynamodb_table.logs.name
}

# ============================================================
# S3 OUTPUTS
# ============================================================

output "s3_assets_bucket_name" {
  description = "S3 bucket for product images"
  value       = aws_s3_bucket.assets.bucket
}

output "s3_pipeline_artifacts_bucket" {
  description = "S3 bucket for CodePipeline artifacts"
  value       = aws_s3_bucket.pipeline_artifacts.bucket
}

# ============================================================
# CI/CD OUTPUTS
# ============================================================

output "codepipeline_name" {
  description = "CodePipeline name"
  value       = aws_codepipeline.pipeline.name
}

output "codestar_connection_arn" {
  description = "GitHub CodeStar Connection ARN — MUST be manually activated in AWS Console after apply"
  value       = aws_codestarconnections_connection.github.arn
}

output "codestar_connection_status" {
  description = "Current activation status of the GitHub connection (must be AVAILABLE)"
  value       = aws_codestarconnections_connection.github.connection_status
}

# ============================================================
# KUBECTL APPLY HINT
# ============================================================

output "kubectl_apply_command" {
  description = "Apply all Kubernetes manifests to the cluster"
  value       = "kubectl apply -f k8s/ --namespace=${var.k8s_namespace}"
}
