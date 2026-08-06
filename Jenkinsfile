pipeline {
    agent any

    environment {
        AWS_REGION = 'ap-south-1'
        AWS_CREDENTIALS_ID = 'aws-credentials' // Jenkins Credentials ID
        ECR_REPOSITORY = 'dev/super_market'
        EKS_CLUSTER_NAME = 'adorable-synth-badger'
        ECR_REGISTRY = ''
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('AWS ECR Login') {
            steps {
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: env.AWS_CREDENTIALS_ID
                ]]) {
                    script {
                        def accountId = sh(script: "aws sts get-caller-identity --query Account --output text", returnStdout: true).trim()
                        env.ECR_REGISTRY = "${accountId}.dkr.ecr.${env.AWS_REGION}.amazonaws.com"
                        sh "aws ecr get-login-password --region ${env.AWS_REGION} | docker login --username AWS --password-stdin ${env.ECR_REGISTRY}"
                    }
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    echo "Building Docker image: ${env.ECR_REGISTRY}/${env.ECR_REPOSITORY}:${env.IMAGE_TAG}"
                    sh "docker build -t ${env.ECR_REGISTRY}/${env.ECR_REPOSITORY}:latest -t ${env.ECR_REGISTRY}/${env.ECR_REPOSITORY}:${env.IMAGE_TAG} ."
                }
            }
        }

        stage('Push Image to Amazon ECR') {
            steps {
                script {
                    echo "Pushing Docker image to Amazon ECR..."
                    sh "docker push ${env.ECR_REGISTRY}/${env.ECR_REPOSITORY}:latest"
                    sh "docker push ${env.ECR_REGISTRY}/${env.ECR_REPOSITORY}:${env.IMAGE_TAG}"
                }
            }
        }

        stage('Deploy to Amazon EKS') {
            steps {
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: env.AWS_CREDENTIALS_ID
                ]]) {
                    script {
                        echo "Updating Kubeconfig for EKS Cluster..."
                        sh "aws eks update-kubeconfig --name ${env.EKS_CLUSTER_NAME} --region ${env.AWS_REGION}"

                        echo "Applying Kubernetes Manifests..."
                        sh "kubectl apply -f k8s/configmap.yaml"
                        sh "kubectl apply -f k8s/secret.yaml"
                        sh "kubectl apply -f k8s/service.yaml"
                        sh "kubectl apply -f k8s/ingress.yaml"
                        sh "kubectl apply -f k8s/deployment.yaml"

                        echo "Updating Deployment Image..."
                        sh "kubectl set image deployment/supermarket-deployment supermarket-container=${env.ECR_REGISTRY}/${env.ECR_REPOSITORY}:${env.IMAGE_TAG} --record"

                        echo "Verifying Rollout Status..."
                        sh "kubectl rollout status deployment/supermarket-deployment --timeout=180s"
                    }
                }
            }
        }
    }

    post {
        success {
            echo "Jenkins Pipeline completed successfully! App deployed to Amazon EKS."
        }
        failure {
            echo "Jenkins Pipeline failed. Check build logs for details."
        }
    }
}
