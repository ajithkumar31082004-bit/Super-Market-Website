# ☸️ Kubernetes & Amazon EKS Deployment Guide

This directory contains the production Kubernetes manifests for deploying **SuperMarket Pro** onto **Amazon EKS (Elastic Kubernetes Service)** or any standard Kubernetes 1.28+ cluster.

---

## 📁 Manifests Overview

| Manifest File | Kind | Description |
|---|---|---|
| [namespace.yaml](file:///c:/Users/ajith/Downloads/Super-Market-Website/k8s/namespace.yaml) | `Namespace` | Dedicated `supermarket` namespace for resource isolation |
| [configmap.yaml](file:///c:/Users/ajith/Downloads/Super-Market-Website/k8s/configmap.yaml) | `ConfigMap` | Non-sensitive application configuration (DB host, AWS table/bucket names, region) |
| [secret.yaml](file:///c:/Users/ajith/Downloads/Super-Market-Website/k8s/secret.yaml) | `Secret` | Sensitive credentials (database password, JWT secret, Gemini API key) |
| [serviceaccount.yaml](file:///c:/Users/ajith/Downloads/Super-Market-Website/k8s/serviceaccount.yaml) | `ServiceAccount` | Kubernetes Service Account annotated with AWS IAM Role for Service Accounts (IRSA) |
| [deployment.yaml](file:///c:/Users/ajith/Downloads/Super-Market-Website/k8s/deployment.yaml) | `Deployment` | 3-replica production deployment with multi-AZ topology spread & health probes |
| [service.yaml](file:///c:/Users/ajith/Downloads/Super-Market-Website/k8s/service.yaml) | `Service` | Internal `ClusterIP` exposing port 80 targeting container port 5000 |
| [ingress.yaml](file:///c:/Users/ajith/Downloads/Super-Market-Website/k8s/ingress.yaml) | `Ingress` | AWS ALB Ingress Controller configuration for public traffic routing |

---

## 🚀 Pre-Deployment Setup

### 1. Configure Kubeconfig for Amazon EKS
```bash
aws eks update-kubeconfig \
  --name <YOUR_EKS_CLUSTER_NAME> \
  --region ap-south-1
```

### 2. Update Configuration Values

#### A. Edit [configmap.yaml](file:///c:/Users/ajith/Downloads/Super-Market-Website/k8s/configmap.yaml)
Replace `DB_HOST` with your actual RDS endpoint:
```yaml
DB_HOST: "supermarket-mysql.c3xxxx.ap-south-1.rds.amazonaws.com"
AWS_S3_BUCKET_NAME: "your-actual-s3-bucket-name"
AWS_SNS_TOPIC_ARN: "arn:aws:sns:ap-south-1:123456789012:SuperMarketOrderNotifications"
```

#### B. Edit [secret.yaml](file:///c:/Users/ajith/Downloads/Super-Market-Website/k8s/secret.yaml)
Ensure secrets are properly base64-encoded or updated with stringData:
```bash
echo -n "YourSecureDbPassword123!" | base64
echo -n "YourJwtSecretKey2026" | base64
echo -n "YourGeminiApiKey" | base64
```

#### C. Update ServiceAccount IRSA ARN in [serviceaccount.yaml](file:///c:/Users/ajith/Downloads/Super-Market-Website/k8s/serviceaccount.yaml)
```yaml
annotations:
  eks.amazonaws.com/role-arn: arn:aws:iam::<ACCOUNT_ID>:role/supermarket-eks-app-pod-role
```

---

## 📦 Deployment Steps

### Step 1: Create Namespace
```bash
kubectl apply -f k8s/namespace.yaml
```

### Step 2: Apply ConfigMaps & Secrets
```bash
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/serviceaccount.yaml
```

### Step 3: Deploy Application & Services
```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

---

## 🔍 Verification & Health Checks

Check pods status across Availability Zones:
```bash
kubectl get pods -n supermarket -o wide
```

Check deployment rollout status:
```bash
kubectl rollout status deployment/supermarket-deployment -n supermarket
```

Inspect pod logs:
```bash
kubectl logs -n supermarket -l app=supermarket-app --tail=100 -f
```

Get the public Application Load Balancer URL:
```bash
kubectl get ingress -n supermarket
```

---

## 🛡️ Production High-Availability Features

1. **Zero-Downtime Rolling Updates**:
   - `maxSurge: 1` ensures a new pod is healthy before terminating an old one.
   - `maxUnavailable: 0` guarantees full capacity during deployments.
2. **Multi-AZ Availability Zone Spread**:
   - `topologySpreadConstraints` distributes replicas evenly across AWS Availability Zones (`ap-south-1a`, `ap-south-1b`, `ap-south-1c`).
3. **Tri-Tier Health Probes**:
   - **Startup Probe**: Allows up to 60s for initialization without premature killing.
   - **Liveness Probe**: Restarts unresponsive containers.
   - **Readiness Probe**: Removes unready containers from the load balancer rotation.
4. **Graceful Termination**:
   - `terminationGracePeriodSeconds: 30` allows active client connections and database transactions to finish cleanly upon pod retirement.
