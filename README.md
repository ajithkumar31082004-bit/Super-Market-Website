# 🛒 SuperMarket Pro — Cloud-Native E-Commerce Platform

![AWS](https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)
![Amazon EKS](https://img.shields.io/badge/Amazon_EKS-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Terraform](https://img.shields.io/badge/Terraform-7B42BC?style=for-the-badge&logo=terraform&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL_RDS-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![DynamoDB](https://img.shields.io/badge/Amazon_DynamoDB-4053D6?style=for-the-badge&logo=amazonaws&logoColor=white)
![Jenkins](https://img.shields.io/badge/Jenkins-D24939?style=for-the-badge&logo=jenkins&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini_AI-8E75B2?style=for-the-badge&logo=google&logoColor=white)

**SuperMarket Pro** is a cloud-native, full-stack enterprise e-commerce platform designed with microservice principles, multi-tier cloud persistence, AI assistance, containerization, and fully automated multi-target CI/CD pipelines (AWS CodePipeline & Jenkins).

---

## 🏛️ System Architecture

```text
                                  ┌──────────────────────────────┐
                                  │      Client Web Browser      │
                                  └──────────────┬───────────────┘
                                                 │
                                                 ▼
                                  ┌──────────────────────────────┐
                                  │   AWS ALB / Ingress Router   │
                                  └──────────────┬───────────────┘
                                                 │
                                                 ▼
                    ┌─────────────────────────────────────────────────────────┐
                    │               Amazon EKS Kubernetes Pods                │
                    │      (Node.js 20 Express App + Static Web Assets)       │
                    └──────┬──────────┬──────────┬──────────┬──────────┬──────┘
                           │          │          │          │          │
         ┌─────────────────┘          │          │          │          └─────────────────┐
         ▼                            ▼          ▼          ▼                            ▼
┌─────────────────┐           ┌───────────┐ ┌─────────┐ ┌────────┐              ┌─────────────────┐
│ Amazon RDS      │           │ Amazon    │ │ Amazon  │ │ Amazon │              │ Google Gemini   │
│ (MySQL Engine)  │           │ DynamoDB  │ │ S3      │ │ SNS    │              │ 2.5 Flash API   │
├─────────────────┤           ├───────────┤ ├─────────┤ ├────────┤              ├─────────────────┤
│ • Users & Auth  │           │ • Live    │ │ • Image │ │ • Order│              │ • Smart Shopping│
│ • Catalog Items │           │   Carts   │ │   Assets│ │   Alerts              │   Assistant     │
│ • Orders History│           │ • Activity│ │ • S3 Pre│ │ • Email│              │ • Product Recs  │
│ • Coupons/Review│           │   Logs    │ │   signed│ │   Push │              └─────────────────┘
└─────────────────┘           └───────────┘ └─────────┘ └────┬───┘
                                                             │
                                                             ▼
                                                    ┌─────────────────┐
                                                    │ AWS Lambda      │
                                                    │ Background Order│
                                                    │ Worker Function │
                                                    └─────────────────┘
```

---

## 🔄 DevOps & CI/CD Pipeline Flow

The repository supports dual automated deployment pipelines:

### 1. AWS CodePipeline + AWS CodeBuild
```text
Git Push (main) ──► AWS CodePipeline ──► AWS CodeBuild (buildspec.yml) ──► Amazon ECR ──► Amazon EKS Rolling Deploy
```

### 2. Jenkins Pipeline (`Jenkinsfile`)
```text
Git Webhook ──► Jenkins Agent ──► Docker Build & Test ──► ECR Push ──► `kubectl apply` & Rollout Verification
```

---

## 📁 Repository Structure

```text
Super-Market-Website/
├── backend/                       # Express.js REST API & Cloud Integrations
│   ├── config/                    # DB connection pools & AWS clients
│   ├── routes/                    # API Route controllers (auth, cart, orders, etc.)
│   ├── services/                  # AWS Service SDK integrations (S3, DynamoDB, SNS, Lambda)
│   ├── init_db.js                 # Database schema initializer and seed script
│   ├── schema.sql                 # MySQL relational schema definition
│   ├── server.js                  # Express application entrypoint
│   └── README.md                  # Detailed Backend API Documentation
│
├── k8s/                           # Kubernetes / Amazon EKS Manifests
│   ├── namespace.yaml             # Dedicated 'supermarket' namespace
│   ├── configmap.yaml             # Non-sensitive runtime configuration
│   ├── secret.yaml                # Encrypted secrets (DB passwords, API keys)
│   ├── serviceaccount.yaml        # IAM Roles for Service Accounts (IRSA)
│   ├── deployment.yaml            # 3-replica deployment with health probes
│   ├── service.yaml               # ClusterIP internal service
│   ├── ingress.yaml               # AWS ALB Ingress controller config
│   └── README.md                  # Kubernetes Deployment Guide
│
├── supermarket-eks/               # Terraform Infrastructure as Code (IaC)
│   ├── vpc.tf                     # 3-AZ Multi-tier VPC with NAT gateways
│   ├── eks.tf                     # Managed EKS Cluster & Node Groups
│   ├── rds.tf                     # RDS MySQL instance with automated subnetting
│   ├── dynamodb.tf                # Serverless DynamoDB tables (Carts & Logs)
│   ├── s3.tf                      # S3 bucket with CORS & public read policy
│   ├── ecr.tf                     # Private container registry
│   ├── iam.tf                     # IRSA, cluster, and CI/CD IAM policies
│   ├── codepipeline.tf            # AWS CodePipeline CI/CD definition
│   └── README.md                  # Terraform Provisioning Guide
│
├── css/                           # Modern responsive CSS design system
├── js/                            # Frontend UI scripts & async API clients
├── products/                      # Static product catalog assets
├── Dockerfile                     # Multi-stage, production-hardened Dockerfile
├── .dockerignore                  # Build context exclusion rules
├── buildspec.yml                  # AWS CodeBuild instruction file
├── Jenkinsfile                    # Jenkins CI/CD pipeline script
└── README.md                      # Master repository documentation
```

---

## ⚡ Key Features

* **Multi-Tier Persistence**:
  * **Relational Data (Amazon RDS MySQL)**: Atomic order processing, user accounts, hashed passwords, product catalog, reviews.
  * **NoSQL Data (Amazon DynamoDB)**: Real-time high-throughput shopping cart state and activity logging.
  * **Object Storage (Amazon S3)**: Secure product media storage with direct client presigned URL uploads.
* **Serverless Background Jobs (AWS Lambda & SNS)**:
  * Asynchronous order fulfillment worker triggered upon checkout.
  * Instant email/SMS order status alerts dispatched via Amazon SNS.
* **AI Shopping Assistant**:
  * Powered by **Google Gemini 2.5 Flash** (`@google/genai`) for real-time customer support, recipe recommendations, and semantic product discovery.
* **Enterprise Kubernetes Operations**:
  * Pod Anti-Affinity & Multi-AZ Topology Spread constraints.
  * Native Zero-Downtime Rolling Updates (`maxSurge: 1, maxUnavailable: 0`).
  * Kubernetes Startup, Liveness, and Readiness probes attached to `/health`.
  * Non-root container security with AWS IAM Roles for Service Accounts (IRSA).

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
* [Node.js 20+](https://nodejs.org/)
* [Docker Desktop](https://www.docker.com/)
* [MySQL 8.0](https://www.mysql.com/) (or local Docker container)

### 2. Clone & Install
```bash
git clone https://github.com/ajithkumar31082004-bit/Super-Market-Website.git
cd Super-Market-Website
npm install --prefix backend
```

### 3. Setup Environment Variables
Create `backend/.env`:
```env
PORT=5000
NODE_ENV=development

# MySQL RDS / Local Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=password
DB_NAME=supermarket_db

# Security
JWT_SECRET=supermarket_jwt_secret_key_2026

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# AWS Services (Optional for full cloud integration)
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET_NAME=supermarket-product-images-unique
AWS_DYNAMODB_CARTS_TABLE=SuperMarket_Carts
AWS_DYNAMODB_LOGS_TABLE=SuperMarket_Logs
AWS_SNS_TOPIC_ARN=arn:aws:sns:ap-south-1:xxx:SuperMarketOrderNotifications
AWS_LAMBDA_BG_WORKER=supermarket-order-processor
```

### 4. Initialize Database
```bash
node backend/init_db.js
```

### 5. Run the Application
```bash
npm start --prefix backend
```
Open [http://localhost:5000](http://localhost:5000) in your browser.

---

## 🐳 Docker Deployment

### Build the Image
```bash
docker build -t supermarket-pro:latest .
```

### Run the Container
```bash
docker run -d \
  --name supermarket-app \
  -p 5000:5000 \
  --env-file backend/.env \
  supermarket-pro:latest
```

Verify container health:
```bash
docker ps
curl http://localhost:5000/health
```

---

## 🚢 Production Deployment to Amazon EKS

1. **Provision Infrastructure with Terraform**:
   Follow instructions in [supermarket-eks/README.md](file:///c:/Users/ajith/Downloads/Super-Market-Website/supermarket-eks/README.md).

2. **Deploy to EKS**:
   Follow instructions in [k8s/README.md](file:///c:/Users/ajith/Downloads/Super-Market-Website/k8s/README.md).

---

## 📄 Documentation Links
* 📦 **[Backend API & Cloud Services Guide](file:///c:/Users/ajith/Downloads/Super-Market-Website/backend/README.md)**
* ☸️ **[Kubernetes & EKS Deployment Guide](file:///c:/Users/ajith/Downloads/Super-Market-Website/k8s/README.md)**
* 🏗️ **[Terraform Infrastructure Guide](file:///c:/Users/ajith/Downloads/Super-Market-Website/supermarket-eks/README.md)**

---

## 📜 License
This project is licensed under the MIT License.
