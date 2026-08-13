# ============================================================
# terraform.tfvars — Populate your actual values here
# ============================================================

aws_region   = "ap-south-1"
project_name = "supermarket"
environment  = "dev"

# EKS Cluster
eks_cluster_version    = "1.29"
eks_node_instance_types = ["t3.medium"]
eks_node_desired_size  = 2
eks_node_min_size      = 1
eks_node_max_size      = 4
eks_node_disk_size     = 20

# Application
container_port = 5000
app_replicas   = 3
k8s_namespace  = "supermarket"

# ECR
ecr_repository_name = "dev/super_market"

# RDS
db_name           = "supermarket_db"
db_username       = "admin"
db_password       = "SuperMarketSecurePass123!"   # TODO: use AWS Secrets Manager or env var
db_instance_class = "db.t3.micro"

# DynamoDB
dynamodb_cart_table_name = "SuperMarket_Carts"
dynamodb_logs_table_name = "SuperMarket_Logs"

# S3
s3_bucket_name = "supermarket-product-images-unique"

# GitHub / CI-CD
github_repo_owner = "ajithkumar31082004-bit"
github_repo_name  = "Super-Market-Website"
github_branch     = "main"
