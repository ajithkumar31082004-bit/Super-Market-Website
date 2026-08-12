output "alb_dns_name" {
  description = "The public DNS name of the Application Load Balancer (Live Website URL)"
  value       = aws_lb.alb.dns_name
}

output "ecr_repository_url" {
  description = "The Amazon ECR repository URL"
  value       = aws_ecr_repository.app.repository_url
}

output "ecs_cluster_name" {
  description = "The Amazon ECS cluster name"
  value       = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  description = "The Amazon ECS service name"
  value       = aws_ecs_service.app.name
}

output "dynamodb_table_name" {
  description = "The Amazon DynamoDB cart table name"
  value       = aws_dynamodb_table.cart.name
}

output "s3_bucket_name" {
  description = "The Amazon S3 product assets bucket name"
  value       = aws_s3_bucket.assets.id
}

output "rds_mysql_endpoint" {
  description = "The Amazon RDS MySQL connection endpoint"
  value       = aws_db_instance.mysql.endpoint
}

output "codepipeline_name" {
  description = "The AWS CodePipeline name"
  value       = aws_codepipeline.pipeline.name
}
