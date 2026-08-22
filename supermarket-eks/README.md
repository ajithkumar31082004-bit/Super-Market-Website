# 🏗️ Terraform Infrastructure as Code (IaC) — Amazon EKS & AWS Cloud

This module provides complete **Terraform Infrastructure as Code (IaC)** to provision the cloud infrastructure for **SuperMarket Pro** on AWS.

---

## ☁️ Provisioned AWS Resources

| Resource | Terraform File | Details |
|---|---|---|
| **VPC & Networking** | [vpc.tf](file:///c:/Users/ajith/Downloads/Super-Market-Website/supermarket-eks/vpc.tf) | 3 Availability Zones, 3 Public Subnets, 3 Private App Subnets, 3 Database Subnets, NAT Gateways, Internet Gateway |
| **Amazon EKS Cluster** | [eks.tf](file:///c:/Users/ajith/Downloads/Super-Market-Website/supermarket-eks/eks.tf) | Kubernetes v1.30 Managed Control Plane, Managed Node Groups (`t3.medium`), OIDC Provider for IRSA |
| **Amazon RDS MySQL** | [rds.tf](file:///c:/Users/ajith/Downloads/Super-Market-Website/supermarket-eks/rds.tf) | MySQL 8.0 Multi-AZ / Single-AZ Database instance isolated in private DB subnets |
| **Amazon DynamoDB** | [dynamodb.tf](file:///c:/Users/ajith/Downloads/Super-Market-Website/supermarket-eks/dynamodb.tf) | `SuperMarket_Carts` & `SuperMarket_Logs` with Pay-Per-Request on-demand capacity |
| **Amazon S3** | [s3.tf](file:///c:/Users/ajith/Downloads/Super-Market-Website/supermarket-eks/s3.tf) | Product media bucket with CORS configuration and public read policy |
| **Amazon ECR** | [ecr.tf](file:///c:/Users/ajith/Downloads/Super-Market-Website/supermarket-eks/ecr.tf) | Container Registry with vulnerability scanning on push and lifecycle pruning |
| **IAM & IRSA** | [iam.tf](file:///c:/Users/ajith/Downloads/Super-Market-Website/supermarket-eks/iam.tf) | Least-privilege IAM Roles for Service Accounts (IRSA), EKS Cluster, Node Groups, and CI/CD |
| **AWS CodePipeline** | [codepipeline.tf](file:///c:/Users/ajith/Downloads/Super-Market-Website/supermarket-eks/codepipeline.tf) | Automated CI/CD pipeline connecting GitHub to AWS CodeBuild and Amazon ECR/EKS |

---

## 📋 Prerequisites

* [Terraform v1.5+](https://www.terraform.io/downloads.html)
* [AWS CLI v2](https://aws.amazon.com/cli/) configured with Administrator credentials:
  ```bash
  aws configure
  ```

---

## 🚀 Provisioning Steps

### 1. Initialize Terraform
```bash
cd supermarket-eks
terraform init
```

### 2. Configure Variables
Inspect or customize [terraform.tfvars](file:///c:/Users/ajith/Downloads/Super-Market-Website/supermarket-eks/terraform.tfvars):
```hcl
aws_region       = "ap-south-1"
environment      = "dev"
project_name     = "supermarket"
cluster_name     = "supermarket-eks-cluster"
db_username      = "admin"
db_password      = "ChangeMeToSecurePassword123!"
s3_bucket_name   = "supermarket-product-images-unique-12345"
```

### 3. Review the Execution Plan
```bash
terraform plan -out=tfplan
```

### 4. Apply Infrastructure
```bash
terraform apply tfplan
```

---

## 📤 Key Terraform Outputs

After a successful `terraform apply`, Terraform outputs the essential connection endpoints:

```bash
# EKS Cluster Name
terraform output cluster_name

# RDS MySQL Connection Endpoint
terraform output rds_endpoint

# ECR Repository URL
terraform output ecr_repository_url

# S3 Bucket Name
terraform output s3_bucket_name

# IAM Role ARN for Kubernetes Service Account (IRSA)
terraform output app_pod_iam_role_arn
```

---

## 🔗 Connect to the Newly Created EKS Cluster

```bash
aws eks update-kubeconfig \
  --name $(terraform output -raw cluster_name) \
  --region $(terraform output -raw aws_region)

# Verify cluster nodes
kubectl get nodes
```

---

## 🧹 Teardown / Destruction

To destroy all cloud resources and avoid unnecessary AWS costs:

```bash
terraform destroy -auto-approve
```
