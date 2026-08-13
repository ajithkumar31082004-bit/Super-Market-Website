# ============================================================
# General
# ============================================================

variable "aws_region" {
  description = "AWS Region to deploy all resources"
  type        = string
  default     = "ap-south-1"
}

variable "project_name" {
  description = "Project name used as a prefix for all resource names"
  type        = string
  default     = "supermarket"
}

variable "environment" {
  description = "Deployment environment (dev / staging / prod)"
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

# ============================================================
# EKS Cluster
# ============================================================

variable "eks_cluster_version" {
  description = "Kubernetes version for the EKS cluster"
  type        = string
  default     = "1.30"
}

variable "eks_node_instance_types" {
  description = "EC2 instance types for the EKS managed node group"
  type        = list(string)
  default     = ["t3.micro"]
}

variable "eks_node_desired_size" {
  description = "Desired number of worker nodes"
  type        = number
  default     = 2
}

variable "eks_node_min_size" {
  description = "Minimum number of worker nodes"
  type        = number
  default     = 1
}

variable "eks_node_max_size" {
  description = "Maximum number of worker nodes (for cluster autoscaler)"
  type        = number
  default     = 4
}

variable "eks_node_disk_size" {
  description = "Root EBS disk size (GB) for each worker node"
  type        = number
  default     = 20
}

# ============================================================
# Application
# ============================================================

variable "container_port" {
  description = "Port exposed by the Node.js Express application"
  type        = number
  default     = 5000
}

variable "app_replicas" {
  description = "Number of Kubernetes pod replicas"
  type        = number
  default     = 3
}

variable "k8s_namespace" {
  description = "Kubernetes namespace for all app resources"
  type        = string
  default     = "supermarket"
}

# ============================================================
# ECR
# ============================================================

variable "ecr_repository_name" {
  description = "Amazon ECR repository name"
  type        = string
  default     = "dev/super_market"
}

# ============================================================
# RDS MySQL
# ============================================================

variable "db_name" {
  description = "MySQL database name"
  type        = string
  default     = "supermarket_db"
}

variable "db_username" {
  description = "MySQL master username"
  type        = string
  default     = "admin"
}

variable "db_password" {
  description = "MySQL master password"
  type        = string
  sensitive   = true
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

# ============================================================
# DynamoDB
# ============================================================

variable "dynamodb_cart_table_name" {
  description = "DynamoDB table for shopping cart state"
  type        = string
  default     = "SuperMarket_Carts"
}

variable "dynamodb_logs_table_name" {
  description = "DynamoDB table for application event logs"
  type        = string
  default     = "SuperMarket_Logs"
}

# ============================================================
# S3
# ============================================================

variable "s3_bucket_name" {
  description = "S3 bucket for product images and static assets"
  type        = string
  default     = "supermarket-product-images-unique"
}

# ============================================================
# CI/CD — GitHub + CodePipeline
# ============================================================

variable "github_repo_owner" {
  description = "GitHub repository owner / organization"
  type        = string
  default     = "ajithkumar31082004-bit"
}

variable "github_repo_name" {
  description = "GitHub repository name"
  type        = string
  default     = "Super-Market-Website"
}

variable "github_branch" {
  description = "GitHub branch that triggers the pipeline"
  type        = string
  default     = "main"
}
