pipeline {
    agent any

    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '20', daysToKeepStr: '30'))
        timestamps()
        disableConcurrentBuilds()
    }

    parameters {
        choice(
            name: 'DEPLOY_TARGET',
            choices: ['ECS', 'EKS', 'BOTH', 'NONE'],
            description: 'Deployment destination platform'
        )
        string(
            name: 'AWS_REGION',
            defaultValue: 'ap-south-1',
            description: 'Target AWS Region'
        )
        string(
            name: 'AWS_ACCOUNT_ID',
            defaultValue: '131708658201',
            description: 'AWS Account ID'
        )
        string(
            name: 'ECR_REPOSITORY',
            defaultValue: 'dev/super_market',
            description: 'Amazon ECR Repository Name'
        )
        string(
            name: 'ECS_CLUSTER_NAME',
            defaultValue: 'SuperMarketPROCIuster',
            description: 'Amazon ECS Cluster Name'
        )
        string(
            name: 'ECS_SERVICE_NAME',
            defaultValue: 'supermarket-service',
            description: 'Amazon ECS Service Name'
        )
        string(
            name: 'ECS_CONTAINER_NAME',
            defaultValue: 'supermarket-container',
            description: 'Container name inside ECS Task Definition'
        )
        string(
            name: 'EKS_CLUSTER_NAME',
            defaultValue: 'supermarket-eks-cluster',
            description: 'Amazon EKS Cluster Name'
        )
        string(
            name: 'K8S_NAMESPACE',
            defaultValue: 'supermarket',
            description: 'Kubernetes Namespace'
        )
        booleanParam(
            name: 'RUN_SECURITY_SCAN',
            defaultValue: true,
            description: 'Run container vulnerability scan using Trivy (if installed)'
        )
    }

    environment {
        AWS_CREDENTIALS_ID  = 'aws-credentials' // Jenkins AWS credentials binding ID
        AWS_REGION          = "${params.AWS_REGION}"
        AWS_ACCOUNT_ID      = "${params.AWS_ACCOUNT_ID}"
        ECR_REPOSITORY      = "${params.ECR_REPOSITORY}"
        ECS_CLUSTER_NAME    = "${params.ECS_CLUSTER_NAME}"
        ECS_SERVICE_NAME    = "${params.ECS_SERVICE_NAME}"
        ECS_CONTAINER_NAME  = "${params.ECS_CONTAINER_NAME}"
        EKS_CLUSTER_NAME    = "${params.EKS_CLUSTER_NAME}"
        K8S_NAMESPACE       = "${params.K8S_NAMESPACE}"
        IMAGE_TAG           = "${BUILD_NUMBER}"
        ECR_REGISTRY        = "${params.AWS_ACCOUNT_ID}.dkr.ecr.${params.AWS_REGION}.amazonaws.com"
        FULL_IMAGE_NAME     = "${params.AWS_ACCOUNT_ID}.dkr.ecr.${params.AWS_REGION}.amazonaws.com/${params.ECR_REPOSITORY}:${BUILD_NUMBER}"
        LATEST_IMAGE_NAME   = "${params.AWS_ACCOUNT_ID}.dkr.ecr.${params.AWS_REGION}.amazonaws.com/${params.ECR_REPOSITORY}:latest"
    }

    stages {
        stage('Checkout Code') {
            steps {
                echo "=========================================="
                echo "📦 Checking out SuperMarket Pro Source Code"
                echo "=========================================="
                checkout scm
                script {
                    echo "Branch/Commit: ${env.GIT_BRANCH ?: 'N/A'} (${env.GIT_COMMIT ?: 'N/A'})"
                    echo "Image Tag    : ${env.IMAGE_TAG}"
                    echo "Target Image : ${env.FULL_IMAGE_NAME}"
                }
            }
        }

        stage('AWS & ECR Authentication') {
            steps {
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: env.AWS_CREDENTIALS_ID
                ]]) {
                    script {
                        echo "=========================================="
                        echo "🔑 Authenticating with Amazon ECR..."
                        echo "=========================================="
                        sh "aws ecr get-login-password --region ${env.AWS_REGION} | docker login --username AWS --password-stdin ${env.ECR_REGISTRY}"
                        echo "✅ Successfully logged in to ${env.ECR_REGISTRY}"
                    }
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    echo "=========================================="
                    echo "🐳 Building Multi-Stage Docker Image..."
                    echo "=========================================="
                    sh """
                        docker build \
                            -t ${env.LATEST_IMAGE_NAME} \
                            -t ${env.FULL_IMAGE_NAME} \
                            .
                    """
                    echo "✅ Docker image build complete."
                }
            }
        }

        stage('Container Security Scan') {
            when {
                expression { return params.RUN_SECURITY_SCAN == true }
            }
            steps {
                script {
                    echo "=========================================="
                    echo "🛡️ Running Vulnerability Scan (Trivy)..."
                    echo "=========================================="
                    def trivyExists = sh(script: "command -v trivy || true", returnStdout: true).trim()
                    if (trivyExists) {
                        sh "trivy image --severity HIGH,CRITICAL --no-progress ${env.FULL_IMAGE_NAME} || true"
                    } else {
                        echo "ℹ️ Trivy not installed on runner. Skipping image vulnerability scan."
                    }
                }
            }
        }

        stage('Push Image to Amazon ECR') {
            steps {
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: env.AWS_CREDENTIALS_ID
                ]]) {
                    script {
                        echo "=========================================="
                        echo "🚀 Pushing Docker images to Amazon ECR..."
                        echo "=========================================="
                        sh """
                            docker push ${env.LATEST_IMAGE_NAME}
                            docker push ${env.FULL_IMAGE_NAME}
                        """
                        echo "✅ Pushed: ${env.FULL_IMAGE_NAME}"
                        echo "✅ Pushed: ${env.LATEST_IMAGE_NAME}"
                    }
                }
            }
        }

        stage('Deploy to Amazon ECS') {
            when {
                expression { return params.DEPLOY_TARGET == 'ECS' || params.DEPLOY_TARGET == 'BOTH' }
            }
            steps {
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: env.AWS_CREDENTIALS_ID
                ]]) {
                    script {
                        echo "=========================================="
                        echo "🚀 Deploying to Amazon ECS..."
                        echo "Cluster : ${env.ECS_CLUSTER_NAME}"
                        echo "Service : ${env.ECS_SERVICE_NAME}"
                        echo "Image   : ${env.FULL_IMAGE_NAME}"
                        echo "=========================================="

                        // Trigger ECS rolling update
                        sh """
                            aws ecs update-service \
                                --cluster ${env.ECS_CLUSTER_NAME} \
                                --service ${env.ECS_SERVICE_NAME} \
                                --force-new-deployment \
                                --region ${env.AWS_REGION}
                        """

                        echo "⏳ Waiting for ECS service to reach steady state..."
                        sh """
                            aws ecs wait services-stable \
                                --cluster ${env.ECS_CLUSTER_NAME} \
                                --services ${env.ECS_SERVICE_NAME} \
                                --region ${env.AWS_REGION}
                        """
                        echo "✅ Amazon ECS service updated and stable."
                    }
                }
            }
        }

        stage('Deploy to Amazon EKS') {
            when {
                expression { return params.DEPLOY_TARGET == 'EKS' || params.DEPLOY_TARGET == 'BOTH' }
            }
            steps {
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: env.AWS_CREDENTIALS_ID
                ]]) {
                    script {
                        echo "=========================================="
                        echo "☸️ Deploying to Amazon EKS (${env.EKS_CLUSTER_NAME})..."
                        echo "=========================================="

                        // Update Kubeconfig
                        sh "aws eks update-kubeconfig --name ${env.EKS_CLUSTER_NAME} --region ${env.AWS_REGION}"

                        // Apply Namespace
                        if (fileExists('k8s/namespace.yaml')) {
                            sh "kubectl apply -f k8s/namespace.yaml"
                        } else {
                            sh "kubectl create namespace ${env.K8S_NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -"
                        }

                        // Apply Kubernetes manifests
                        if (fileExists('k8s/configmap.yaml'))       sh "kubectl apply -f k8s/configmap.yaml -n ${env.K8S_NAMESPACE}"
                        if (fileExists('k8s/secret.yaml'))          sh "kubectl apply -f k8s/secret.yaml -n ${env.K8S_NAMESPACE}"
                        if (fileExists('k8s/serviceaccount.yaml'))  sh "kubectl apply -f k8s/serviceaccount.yaml -n ${env.K8S_NAMESPACE}"
                        if (fileExists('k8s/service.yaml'))         sh "kubectl apply -f k8s/service.yaml -n ${env.K8S_NAMESPACE}"
                        if (fileExists('k8s/ingress.yaml'))         sh "kubectl apply -f k8s/ingress.yaml -n ${env.K8S_NAMESPACE}"
                        if (fileExists('k8s/deployment.yaml'))      sh "kubectl apply -f k8s/deployment.yaml -n ${env.K8S_NAMESPACE}"

                        // Update deployment container image
                        sh "kubectl set image deployment/supermarket-deployment supermarket-container=${env.FULL_IMAGE_NAME} -n ${env.K8S_NAMESPACE} --record"

                        // Verify rollout
                        sh "kubectl rollout status deployment/supermarket-deployment -n ${env.K8S_NAMESPACE} --timeout=300s"
                        echo "✅ Amazon EKS deployment rollout complete."
                    }
                }
            }
        }

        stage('Verify & Health Check') {
            steps {
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: env.AWS_CREDENTIALS_ID
                ]]) {
                    script {
                        echo "=========================================="
                        echo "🔍 Verifying Deployment Status..."
                        echo "=========================================="
                        if (params.DEPLOY_TARGET == 'ECS' || params.DEPLOY_TARGET == 'BOTH') {
                            sh "aws ecs describe-services --cluster ${env.ECS_CLUSTER_NAME} --services ${env.ECS_SERVICE_NAME} --region ${env.AWS_REGION} --query 'services[0].[serviceName,status,runningCount,desiredCount]' --output table"
                        }
                        if (params.DEPLOY_TARGET == 'EKS' || params.DEPLOY_TARGET == 'BOTH') {
                            sh "kubectl get pods -n ${env.K8S_NAMESPACE} -l app=supermarket-app -o wide || true"
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                echo "🧹 Cleaning up runner images..."
                sh """
                    docker rmi ${env.FULL_IMAGE_NAME} || true
                    docker rmi ${env.LATEST_IMAGE_NAME} || true
                """
            }
        }
        success {
            echo "🎉 Pipeline succeeded! Image '${env.FULL_IMAGE_NAME}' deployed successfully."
        }
        failure {
            echo "❌ Pipeline failed! Please review stage logs above."
        }
    }
}
