# 🛒 Cloud-Native E-Commerce Platform & Automated CI/CD Pipeline

![AWS](https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Amazon ECS](https://img.shields.io/badge/Amazon_ECS_Fargate-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white)
![AWS CodePipeline](https://img.shields.io/badge/AWS_CodePipeline-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![DynamoDB](https://img.shields.io/badge/Amazon_DynamoDB-4053D6?style=for-the-badge&logo=amazonaws&logoColor=white)

A full-stack e-commerce web application powered by **Node.js, Express, AWS Cloud Services (RDS MySQL, DynamoDB, S3, SNS, Lambda)** and deployed via an automated continuous integration and continuous deployment (**CI/CD**) pipeline using **AWS CodePipeline, AWS CodeBuild, Amazon ECR, and Amazon ECS (Fargate)**.

---

## 🏗️ DevOps Architecture & CI/CD Pipeline Flow

```text
  [ Developer Push ]
          │
          ▼
    ┌──────────┐
    │  GitHub  │ (Source Code Repository)
    └────┬─────┘
         │ Webhook Trigger
         ▼
┌──────────────────┐
│ AWS CodePipeline │ (CI/CD Orchestrator)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  AWS CodeBuild   │ ──(buildspec.yml)──► Builds & Tags Docker Container
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│    Amazon ECR    │ (Stores Container Images)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Amazon ECS       │ (Deploys container to serverless Fargate tasks behind ALB)
│ (Fargate Task)   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 🌐 Live Website  │ (Accessible via Application Load Balancer / Domain)
└──────────────────┘
```

---

## 🚀 Architectural Components & AWS Services

### 📦 1. DevOps & Container Deployment
* **GitHub**: Source code management, triggering automated builds upon git push to `main`.
* **AWS CodePipeline**: Automates the CI/CD pipeline lifecycle from code checkouts to live deployment.
* **AWS CodeBuild**: Executes `buildspec.yml` to compile application code, build container images, run tests, and authenticate with ECR.
* **Amazon ECR (Elastic Container Registry)**: Secure, private Docker container registry storing versioned image tags.
* **Amazon ECS (Fargate)**: Serverless container compute engine running Docker containers without managing underlying EC2 instances.

### ⚡ 2. Application & Backend Services
* **Node.js & Express API**: Core RESTful services handling routing, middleware, and business logic.
* **Amazon DynamoDB**: High-performance NoSQL database for fast cart session storage and real-time state synchronization.
* **Amazon RDS (MySQL)**: Scalable relational database for persistent user records, catalog items, and order transactions.
* **Amazon S3**: Object storage for secure product asset management and image uploads.
* **AWS Lambda & SNS**: Event-driven order processing pipeline with notification dispatch via SNS.

---

## 🛠️ Repository Structure

```text
Super-Market-Website/
├── backend/
│   ├── config/            # AWS & DB configuration files
│   ├── routes/            # REST API route handlers (cart, orders, products, upload)
│   ├── services/          # DynamoDB, RDS, S3, & SNS service abstractions
│   ├── lambdaHandler.js   # Serverless order processing handler
│   ├── schema.sql         # Database initial schema
│   └── server.js          # Main Express server entrypoint
├── css/                   # Stylesheets
├── js/                    # Client-side dynamic scripting & API integration
├── k8s/                   # Kubernetes manifests (alternative deployment target)
├── Dockerfile             # Multi-stage Docker container build definition
├── buildspec.yml          # AWS CodeBuild configuration file
└── README.md              # Project documentation
```

---

## ⚙️ CI/CD Buildspec Overview (`buildspec.yml`)

The deployment process follows these execution phases in AWS CodeBuild:

1. **Pre-Build**: Log in to Amazon ECR registry using AWS CLI and retrieve commit hash for tagging.
2. **Build**: Build multi-stage Docker image using `Dockerfile` tagged with git commit SHA and `latest`.
3. **Post-Build**: Push image tags to Amazon ECR and trigger Amazon ECS task definition update for zero-downtime rolling updates.

---

## 🔧 Local Setup & Run

### Prerequisites
* [Node.js v18+](https://nodejs.org/)
* [Docker Desktop](https://www.docker.com/)
* [AWS CLI](https://aws.amazon.com/cli/) (configured with IAM credentials)

### Step-by-Step Instructions

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/Super-Market-Website.git
   cd Super-Market-Website
   ```

2. **Configure Environment Variables**
   Create a `.env` file inside `backend/`:
   ```env
   PORT=5000
   AWS_REGION=ap-south-1
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   DYNAMODB_TABLE_CART=SuperMarketCart
   S3_BUCKET_NAME=supermarket-assets
   ```

3. **Run Locally with Docker**
   ```bash
   docker build -t supermarket-app .
   docker run -p 5000:5000 --env-file backend/.env supermarket-app
   ```
   Access application at `http://localhost:5000`.

---

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
