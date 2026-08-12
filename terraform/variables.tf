variable "aws_region" {
  description = "AWS Region to deploy resources"
  type        = string
  default     = "ap-south-1"
}

variable "project_name" {
  description = "Project name prefix for resources"
  type        = string
  default     = "supermarket"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "container_port" {
  description = "Port exposed by the Node.js Express application container"
  type        = number
  default     = 5000
}

variable "ecr_repository_name" {
  description = "Amazon ECR Repository Name"
  type        = string
  default     = "dev/super_market"
}

variable "dynamodb_cart_table_name" {
  description = "DynamoDB Cart Table Name"
  type        = string
  default     = "SuperMarketCart"
}

variable "s3_bucket_name" {
  description = "Amazon S3 Bucket Name for product assets"
  type        = string
  default     = "supermarket-assets-bucket-unique"
}

variable "db_name" {
  description = "RDS MySQL Database Name"
  type        = string
  default     = "supermarket_db"
}

variable "db_username" {
  description = "RDS MySQL Master Username"
  type        = string
  default     = "admin"
}

variable "db_password" {
  description = "RDS MySQL Master Password"
  type        = string
  sensitive   = true
  default     = "SuperMarketSecurePass123!"
}

variable "github_repo_owner" {
  description = "GitHub Repository Owner / Username"
  type        = string
  default     = "ajithkumar31082004-bit"
}

variable "github_repo_name" {
  description = "GitHub Repository Name"
  type        = string
  default     = "Super-Market-Website"
}

variable "github_branch" {
  description = "GitHub Branch to trigger CodePipeline"
  type        = string
  default     = "main"
}
