# Online Examination Platform - DevOps Project

This repository contains an end-to-end DevOps implementation for an Online Examination Platform. It demonstrates how a simple examination application can be developed, containerized, tested, deployed to AWS infrastructure, exposed through Kubernetes, scaled automatically, and monitored with Prometheus and Grafana.

The project is intentionally small at the application layer so the DevOps flow is easy to understand. The main value of this repository is the complete deployment pipeline and infrastructure setup:

```text
GitHub -> GitHub Actions -> Jenkins -> Docker -> Amazon ECR -> Terraform -> AWS EKS -> Kubernetes -> Prometheus/Grafana
```

Vault is intentionally not included in this version. Secrets are represented with a Kubernetes Secret manifest for simplicity. In a production system, that Secret should be replaced with a proper secret manager such as AWS Secrets Manager, External Secrets Operator, or HashiCorp Vault.

---

## Table of Contents

- [Project Overview](#project-overview)
- [What This Project Demonstrates](#what-this-project-demonstrates)
- [Architecture](#architecture)
- [Repository Structure](#repository-structure)
- [Application Details](#application-details)
- [Frontend Details](#frontend-details)
- [Backend API Details](#backend-api-details)
- [Docker Setup](#docker-setup)
- [Terraform Infrastructure](#terraform-infrastructure)
- [Kubernetes Deployment](#kubernetes-deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring and Observability](#monitoring-and-observability)
- [Local Development](#local-development)
- [AWS Deployment Guide](#aws-deployment-guide)
- [Validation and Troubleshooting](#validation-and-troubleshooting)
- [Security Notes](#security-notes)
- [Current Limitations](#current-limitations)
- [Future Improvements](#future-improvements)

---

## Project Overview

The Online Examination Platform contains:

- A sample Node.js/Express backend API.
- A standalone static frontend exam portal.
- Docker configuration for local container testing.
- Terraform code to provision AWS infrastructure.
- Kubernetes manifests to run the backend on EKS.
- Jenkins pipeline for build, push, and deploy automation.
- GitHub Actions workflow for pull request and main branch validation.
- Prometheus and Grafana configuration for monitoring.

The backend currently exposes a small mock API for exams and submissions. The frontend in `public/index.html` is a browser-based examination portal with login, exam listing, timed quiz flow, question navigation, auto-submit behavior, and score display.

The AWS infrastructure provisions a realistic cloud foundation:

- VPC with public and private subnets.
- Internet Gateway and NAT Gateway.
- EKS cluster with managed worker nodes.
- ECR repository for Docker images.
- RDS PostgreSQL database.
- S3 bucket for static assets or exam files.
- IAM roles and policies required by EKS.

---

## What This Project Demonstrates

This project is useful as a DevOps end-semester project because it covers the major areas expected in a modern deployment workflow:

- Source control using GitHub.
- Automated CI checks using GitHub Actions.
- CI/CD pipeline using Jenkins.
- Containerization using Docker.
- Local multi-container testing using Docker Compose.
- Infrastructure as Code using Terraform.
- Cloud deployment on AWS.
- Kubernetes workload deployment on Amazon EKS.
- Service exposure using Kubernetes Service and Ingress.
- Horizontal Pod Autoscaling.
- Centralized metrics using Prometheus.
- Visualization using Grafana.
- Basic secret handling using Kubernetes Secrets.
- Health checks using liveness and readiness probes.

---

## Architecture

At a high level, the system is divided into four layers.

### 1. Application Layer

The application layer contains the online exam functionality.

- `public/index.html` provides the browser UI.
- `app/server.js` provides the backend API.
- The backend is written with Express.js.
- Exam data is currently in memory for demonstration.

### 2. Container Layer

The backend is packaged as a Docker image.

- `app/Dockerfile` builds the Node.js backend image.
- The image runs as a non-root user.
- The container exposes port `3000`.
- A Docker health check calls `/healthz`.

### 3. Infrastructure Layer

Terraform provisions the AWS resources.

- `terraform/vpc.tf` creates the networking layer.
- `terraform/eks.tf` creates EKS, node groups, IAM roles, and ECR.
- `terraform/rds_s3.tf` creates RDS PostgreSQL, an S3 bucket, and the RDS security group.
- `terraform/outputs.tf` prints useful values after deployment.

### 4. Platform Layer

Kubernetes runs the backend workload.

- `k8s/deployment.yaml` creates backend pods.
- `k8s/service.yaml` exposes the pods inside the cluster.
- `k8s/ingress.yaml` exposes the service through an AWS Application Load Balancer.
- `k8s/hpa.yaml` enables autoscaling.
- `monitoring/servicemonitor.yaml` configures Prometheus scraping.

---

## Repository Structure

```text
exam-platform/
├── app/
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
├── public/
│   └── index.html
├── docker-compose.yml
├── terraform/
│   ├── main.tf
│   ├── variables.tf
│   ├── vpc.tf
│   ├── eks.tf
│   ├── rds_s3.tf
│   └── outputs.tf
├── k8s/
│   ├── namespace-and-secret.yaml
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   ├── hpa.yaml
│   └── iam_policy.json
├── monitoring/
│   ├── monitoring-values.yaml
│   ├── servicemonitor.yaml
│   └── dashboards/
│       └── exam-backend-dashboard.json
├── .github/
│   └── workflows/
│       └── ci.yml
├── Jenkinsfile
└── README.md
```

### Important Files

| File | Purpose |
| --- | --- |
| `app/server.js` | Express backend API for exam listing, health checks, and submission |
| `public/index.html` | Standalone frontend examination portal |
| `app/Dockerfile` | Production Docker image definition for the backend |
| `docker-compose.yml` | Local container setup for backend and PostgreSQL |
| `terraform/main.tf` | Terraform provider and version configuration |
| `terraform/vpc.tf` | VPC, subnets, route tables, NAT Gateway, and Internet Gateway |
| `terraform/eks.tf` | EKS cluster, node group, IAM roles, and ECR repository |
| `terraform/rds_s3.tf` | RDS PostgreSQL database, S3 bucket, and RDS security group |
| `k8s/deployment.yaml` | Kubernetes backend Deployment |
| `k8s/service.yaml` | Internal ClusterIP service for the backend |
| `k8s/ingress.yaml` | ALB Ingress definition |
| `k8s/hpa.yaml` | Horizontal Pod Autoscaler |
| `monitoring/monitoring-values.yaml` | Helm values for kube-prometheus-stack |
| `monitoring/servicemonitor.yaml` | Prometheus Operator scrape configuration |
| `.github/workflows/ci.yml` | GitHub Actions CI workflow |
| `Jenkinsfile` | Jenkins build and deployment pipeline |

---

## Application Details

The application simulates an online exam platform for students. The frontend provides the exam-taking experience, while the backend provides simple API endpoints that can later be connected to a real database.

Main user flow:

1. Student enters name and roll number.
2. Student views available examinations.
3. Student starts an exam.
4. A timer begins.
5. Student answers multiple-choice questions.
6. Student can move between questions using navigation controls.
7. Exam is submitted manually or automatically when time expires.
8. Score and answer review are displayed.

The current project is best understood as a DevOps-ready prototype. It is not yet a full production learning management system.

---

## Frontend Details

The frontend is located at:

```text
public/index.html
```

It is a standalone HTML, CSS, and JavaScript application. It does not currently require a frontend build tool such as React, Vite, Angular, or Webpack.

Frontend features:

- Student login form.
- Exam dashboard.
- Multiple exam cards.
- Timed quiz interface.
- Question palette.
- Answer selection.
- Previous and next navigation.
- Automatic submission when the timer reaches zero.
- Result page with score and correct answers.

Because the frontend is static, it can be opened directly in a browser:

```bash
open public/index.html
```

On Linux:

```bash
xdg-open public/index.html
```

On Windows PowerShell:

```powershell
start public/index.html
```

The frontend currently uses mock exam data embedded inside the HTML file. It does not yet call the backend API.

---

## Backend API Details

The backend is located at:

```text
app/server.js
```

It uses:

- Node.js
- Express.js
- JSON request parsing
- In-memory exam data

### API Endpoints

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/` | Returns a basic API status message |
| `GET` | `/healthz` | Liveness endpoint for Docker and Kubernetes |
| `GET` | `/readyz` | Readiness endpoint for Kubernetes |
| `GET` | `/api/exams` | Returns the sample list of exams |
| `POST` | `/api/exams/:id/submit` | Accepts submitted answers for an exam |

### Example API Usage

Start the backend:

```bash
cd app
npm install
npm start
```

Check the API:

```bash
curl http://localhost:3000/
```

Expected response:

```json
{
  "message": "Online Examination Platform API is running"
}
```

Fetch exams:

```bash
curl http://localhost:3000/api/exams
```

Submit answers:

```bash
curl -X POST http://localhost:3000/api/exams/1/submit \
  -H "Content-Type: application/json" \
  -d '{"answers":{"1":"B","2":"C"}}'
```

---

## Docker Setup

The backend Docker image is defined in:

```text
app/Dockerfile
```

Important Docker features:

- Uses `node:20-alpine`.
- Installs only production dependencies.
- Creates and runs as a non-root user.
- Exposes port `3000`.
- Includes a container health check.
- Starts the app with `node server.js`.

### Build the Docker Image Manually

From the project root:

```bash
docker build -t exam-platform-backend:local ./app
```

Run the image:

```bash
docker run --rm -p 3000:3000 exam-platform-backend:local
```

Test it:

```bash
curl http://localhost:3000/healthz
```

---

## Docker Compose Setup

The `docker-compose.yml` file runs:

- `exam-backend`: the Express backend.
- `postgres`: a local PostgreSQL 16 container.

Start local containers:

```bash
docker compose up --build
```

Access the backend:

```text
http://localhost:3000
```

Stop containers:

```bash
docker compose down
```

Remove containers and database volume:

```bash
docker compose down -v
```

Important note: PostgreSQL is started by Docker Compose, but the current backend code does not yet connect to PostgreSQL. The database container is included to show how the system will support persistent exam data in a future version.

---

## Terraform Infrastructure

Terraform files are stored in:

```text
terraform/
```

### Provider Configuration

`main.tf` configures:

- Terraform version `>= 1.5.0`.
- AWS provider `~> 5.0`.
- AWS region from `var.aws_region`.

Default region:

```text
ap-south-1
```

### Variables

Key variables are defined in `variables.tf`.

| Variable | Default | Description |
| --- | --- | --- |
| `aws_region` | `ap-south-1` | AWS region |
| `project_name` | `exam-platform` | Prefix used for resource names |
| `vpc_cidr` | `10.0.0.0/16` | VPC CIDR range |
| `azs` | `["ap-south-1a", "ap-south-1b"]` | Availability zones |
| `private_subnet_cidrs` | `["10.0.1.0/24", "10.0.2.0/24"]` | Private subnet CIDRs |
| `public_subnet_cidrs` | `["10.0.101.0/24", "10.0.102.0/24"]` | Public subnet CIDRs |
| `cluster_version` | `1.33` | Kubernetes version for EKS |
| `node_instance_type` | `t3.micro` | EKS worker node instance type |
| `db_username` | `examadmin` | RDS master username |
| `db_password` | none | RDS master password, required at apply time |

### VPC Resources

`vpc.tf` creates:

- One VPC.
- Two public subnets.
- Two private subnets.
- Internet Gateway.
- Elastic IP for NAT Gateway.
- NAT Gateway.
- Public route table.
- Private route table.
- Route table associations.

The public subnets are tagged for external load balancers:

```text
kubernetes.io/role/elb = 1
```

The private subnets are tagged for internal load balancers:

```text
kubernetes.io/role/internal-elb = 1
```

Both public and private subnets are tagged for the EKS cluster.

### EKS Resources

`eks.tf` creates:

- IAM role for the EKS control plane.
- EKS cluster.
- IAM role for worker nodes.
- Managed node group.
- ECR repository.

The node group runs in private subnets. This is a good default because worker nodes do not need direct public IP exposure.

### RDS and S3 Resources

`rds_s3.tf` creates:

- RDS security group.
- DB subnet group using private subnets.
- PostgreSQL RDS instance.
- S3 bucket.
- S3 public access block.
- S3 versioning.

The RDS instance is:

- PostgreSQL.
- Private, not publicly accessible.
- Placed in private subnets.
- Protected by a security group.

Current RDS settings are suitable for a demo or exam project, not for production:

- `skip_final_snapshot = true`
- `backup_retention_period = 0`
- `multi_az = false`
- `db.t3.micro`

### Terraform Outputs

After `terraform apply`, the following outputs are available:

| Output | Purpose |
| --- | --- |
| `eks_cluster_name` | Used by `aws eks update-kubeconfig` |
| `eks_cluster_endpoint` | EKS API endpoint |
| `rds_endpoint` | Database endpoint for app configuration |
| `s3_bucket_name` | Static asset or file bucket |
| `ecr_repository_url` | Docker image repository |
| `vpc_id` | VPC identifier |

---

## Kubernetes Deployment

Kubernetes manifests are stored in:

```text
k8s/
```

### Namespace and Secret

`namespace-and-secret.yaml` creates:

- Namespace: `exam-platform`
- Secret: `exam-db-secret`

The Deployment reads `DB_HOST` from this Secret:

```yaml
env:
  - name: DB_HOST
    valueFrom:
      secretKeyRef:
        name: exam-db-secret
        key: host
```

For a clean deployment, create or update the Secret using the RDS endpoint from Terraform:

```bash
kubectl create namespace exam-platform

kubectl create secret generic exam-db-secret \
  --from-literal=host="<RDS_ENDPOINT>:5432" \
  -n exam-platform
```

If the namespace or Secret already exists, use:

```bash
kubectl create secret generic exam-db-secret \
  --from-literal=host="<RDS_ENDPOINT>:5432" \
  -n exam-platform \
  --dry-run=client -o yaml | kubectl apply -f -
```

### Deployment

`deployment.yaml` creates the backend Deployment.

Important settings:

- Deployment name: `exam-backend`
- Namespace: `exam-platform`
- Replicas: `2`
- Container port: `3000`
- Image: ECR backend image
- Liveness probe: `/healthz`
- Readiness probe: `/readyz`
- CPU request: `100m`
- Memory request: `128Mi`
- CPU limit: `500m`
- Memory limit: `256Mi`

The image is currently:

```text
833082650522.dkr.ecr.ap-south-1.amazonaws.com/exam-platform-backend:latest
```

Jenkins updates the image tag during deployment using:

```bash
kubectl set image deployment/exam-backend exam-backend=<ECR_REPO>:<IMAGE_TAG> -n exam-platform
```

### Service

`service.yaml` creates a ClusterIP service:

- Service name: `exam-backend-svc`
- Service port: `80`
- Target port: `3000`
- Named port: `http`

The named `http` port is important because `monitoring/servicemonitor.yaml` refers to it.

### Ingress

`ingress.yaml` creates an ALB-backed Ingress.

Important annotations:

```yaml
kubernetes.io/ingress.class: "alb"
alb.ingress.kubernetes.io/scheme: internet-facing
alb.ingress.kubernetes.io/target-type: ip
```

Before applying Ingress in a real environment, set a valid host:

```yaml
rules:
  - host: exams.example.com
```

The current file has an empty host field, so you should replace it with your real domain or remove the `host` field if you want hostless routing.

### HPA

`hpa.yaml` creates a Horizontal Pod Autoscaler:

- Minimum replicas: `2`
- Maximum replicas: `10`
- CPU target: `70%`
- Memory target: `80%`

The HPA requires metrics-server to be available in the cluster.

---

## CI/CD Pipeline

The project has two automation layers:

1. GitHub Actions for basic CI validation.
2. Jenkins for full build, push, and deployment.

### GitHub Actions

Workflow file:

```text
.github/workflows/ci.yml
```

It runs on:

- Pull requests to `main`.
- Pushes to `main`.

Workflow steps:

1. Checkout code.
2. Set up Node.js 20.
3. Install backend dependencies.
4. Run backend tests.
5. Build Docker image for validation.

Current test command:

```bash
npm test
```

At the moment, this command only prints:

```text
No tests specified yet
```

and exits successfully. Real unit or integration tests should be added later.

### Jenkins Pipeline

Pipeline file:

```text
Jenkinsfile
```

Pipeline stages:

1. `Checkout`
2. `Install & Test`
3. `Build Docker Image`
4. `Push to ECR`
5. `Deploy to EKS`

The Jenkins pipeline uses these environment values:

```groovy
AWS_REGION    = 'ap-south-1'
ECR_REPO      = '833082650522.dkr.ecr.ap-south-1.amazonaws.com/exam-platform-backend'
IMAGE_TAG     = "${env.BUILD_NUMBER}"
EKS_CLUSTER   = 'exam-platform-eks'
K8S_NAMESPACE = 'exam-platform'
```

The build number becomes the Docker image tag, which makes each deployment traceable.

Example image tags:

```text
exam-platform-backend:14
exam-platform-backend:15
exam-platform-backend:latest
```

Jenkins pushes both:

- A build-specific tag.
- The `latest` tag.

Then Jenkins updates the Kubernetes Deployment to the build-specific tag and waits for rollout completion.

---

## Monitoring and Observability

Monitoring files are stored in:

```text
monitoring/
```

The project uses the `kube-prometheus-stack` Helm chart, which installs:

- Prometheus
- Grafana
- Alertmanager
- Node exporters
- Kubernetes service monitors
- Default Kubernetes dashboards

### Monitoring Values

`monitoring-values.yaml` configures:

- Prometheus retention: `15d`
- Prometheus CPU and memory resources
- Grafana enabled
- Grafana admin password
- Dashboard provider for exam platform dashboards
- Alertmanager enabled

Important security note: do not commit a real Grafana admin password in a production repository. Use Helm `--set`, an external secret, or a sealed secret.

### ServiceMonitor

`servicemonitor.yaml` tells Prometheus to scrape:

- Namespace: `exam-platform`
- Service label: `app=exam-backend`
- Port: `http`
- Path: `/metrics`
- Interval: `15s`

Important note: the current Express backend does not yet expose `/metrics`. To make the ServiceMonitor fully useful, add a Prometheus metrics package such as `prom-client` and expose a `/metrics` endpoint from `server.js`.

### Grafana Dashboard

The dashboard file is:

```text
monitoring/dashboards/exam-backend-dashboard.json
```

It is intended to show backend-related metrics such as:

- CPU usage.
- Memory usage.
- Pod count.
- Request or service-level metrics once `/metrics` is implemented.

---

## Local Development

### Prerequisites

Install:

- Node.js 20 or later
- npm
- Docker
- Docker Compose
- Terraform
- AWS CLI
- kubectl
- Helm

### Run Backend Locally Without Docker

```bash
cd app
npm install
npm start
```

Backend URL:

```text
http://localhost:3000
```

Health check:

```bash
curl http://localhost:3000/healthz
```

Readiness check:

```bash
curl http://localhost:3000/readyz
```

### Run Backend With Docker Compose

From the project root:

```bash
docker compose up --build
```

Backend URL:

```text
http://localhost:3000
```

PostgreSQL URL inside Docker network:

```text
postgres:5432
```

### Run Frontend Locally

The frontend is static:

```bash
open public/index.html
```

Or serve it with any static server:

```bash
cd public
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

---

## AWS Deployment Guide

This section describes the full AWS deployment flow.

### Step 1: Configure AWS CLI

```bash
aws configure
```

Use an IAM user or role with permissions to manage:

- VPC
- EC2
- EKS
- IAM
- ECR
- RDS
- S3
- CloudWatch
- Elastic Load Balancing

### Step 2: Provision Infrastructure

```bash
cd terraform
terraform init
terraform fmt
terraform validate
terraform plan -var="db_password=<strong-password>"
terraform apply -var="db_password=<strong-password>"
```

Save these outputs:

```bash
terraform output
```

You will need:

- `ecr_repository_url`
- `eks_cluster_name`
- `rds_endpoint`

### Step 3: Connect kubectl to EKS

```bash
aws eks update-kubeconfig \
  --region ap-south-1 \
  --name exam-platform-eks
```

Verify:

```bash
kubectl get nodes
```

### Step 4: Build and Push Docker Image

Use the ECR repository URL from Terraform output.

```bash
aws ecr get-login-password --region ap-south-1 | \
  docker login --username AWS --password-stdin <ECR_REPO_URL>

docker build -t <ECR_REPO_URL>:latest ./app
docker push <ECR_REPO_URL>:latest
```

### Step 5: Create Namespace and Secret

```bash
kubectl create namespace exam-platform

kubectl create secret generic exam-db-secret \
  --from-literal=host="<RDS_ENDPOINT>:5432" \
  -n exam-platform
```

### Step 6: Deploy Kubernetes Manifests

```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/hpa.yaml
```

Apply Ingress after installing the AWS Load Balancer Controller and setting a valid host:

```bash
kubectl apply -f k8s/ingress.yaml
```

### Step 7: Verify Deployment

```bash
kubectl get pods -n exam-platform
kubectl get svc -n exam-platform
kubectl get deploy -n exam-platform
kubectl get hpa -n exam-platform
kubectl get ingress -n exam-platform
```

Check rollout:

```bash
kubectl rollout status deployment/exam-backend -n exam-platform
```

Check logs:

```bash
kubectl logs -n exam-platform deployment/exam-backend
```

Port-forward locally:

```bash
kubectl port-forward -n exam-platform svc/exam-backend-svc 3000:80
```

Then open:

```text
http://localhost:3000
```

---

## AWS Load Balancer Controller

The Ingress uses AWS ALB annotations. For it to work, the AWS Load Balancer Controller must be installed in the EKS cluster.

The file `k8s/iam_policy.json` contains an IAM policy suitable for the controller. The usual setup flow is:

1. Create IAM policy from `k8s/iam_policy.json`.
2. Associate IAM OIDC provider with the EKS cluster.
3. Create a Kubernetes service account with the IAM role.
4. Install AWS Load Balancer Controller using Helm.
5. Apply the Ingress manifest.

Without the controller, `k8s/ingress.yaml` will not create an AWS Application Load Balancer.

---

## Install Monitoring

Add the Helm repository:

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
```

Install kube-prometheus-stack:

```bash
helm install monitoring prometheus-community/kube-prometheus-stack \
  -n monitoring \
  --create-namespace \
  -f monitoring/monitoring-values.yaml
```

Apply ServiceMonitor:

```bash
kubectl apply -f monitoring/servicemonitor.yaml
```

Access Grafana:

```bash
kubectl port-forward -n monitoring svc/monitoring-grafana 3001:80
```

Open:

```text
http://localhost:3001
```

Default username:

```text
admin
```

The password is currently configured in `monitoring/monitoring-values.yaml`. For real deployments, override it securely instead of committing it.

---

## Validation and Troubleshooting

### Validate Kubernetes YAML Syntax

```bash
ruby -e 'require "yaml"; ARGV.each { |f| YAML.load_stream(File.read(f)); puts "OK #{f}" }' k8s/*.yaml
```

Or use kubectl dry-run after your kubeconfig is valid:

```bash
kubectl apply --dry-run=client -f k8s/
```

### Validate Terraform Formatting

```bash
cd terraform
terraform fmt -check
```

Auto-format:

```bash
terraform fmt
```

Validate Terraform:

```bash
terraform validate
```

If the AWS provider plugin is corrupted or fails to start, reinitialize providers:

```bash
terraform init -upgrade
```

### Validate Node.js Syntax

```bash
node --check app/server.js
```

### Common Kubernetes Commands

```bash
kubectl get all -n exam-platform
kubectl describe pod -n exam-platform <pod-name>
kubectl logs -n exam-platform <pod-name>
kubectl describe deployment -n exam-platform exam-backend
kubectl describe ingress -n exam-platform exam-backend-ingress
```

### Common Issues

| Issue | Likely Cause | Fix |
| --- | --- | --- |
| Pods stuck in `ImagePullBackOff` | ECR image missing or node cannot pull image | Check image URL, ECR permissions, and pushed tags |
| Pods fail readiness probe | `/readyz` endpoint unavailable or app crashed | Check pod logs |
| Ingress does not get address | AWS Load Balancer Controller missing | Install controller and IAM policy |
| HPA shows unknown metrics | metrics-server missing | Install metrics-server |
| Prometheus cannot scrape backend | `/metrics` endpoint missing | Add `prom-client` metrics endpoint |
| Terraform validate fails due provider plugin | Corrupted/incompatible provider cache | Run `terraform init -upgrade` |
| RDS cannot be reached | Security group or subnet routing issue | Check RDS SG, VPC CIDR, private subnets, and DNS |

---

## Security Notes

This repository is a learning project, but it still includes several good security practices:

- Backend container runs as a non-root user.
- RDS is private and not publicly accessible.
- EKS worker nodes run in private subnets.
- S3 public access is blocked.
- Kubernetes Secret is used instead of plain environment values in Deployment.
- Docker image is built from a small Alpine base image.

Important production improvements:

- Do not commit real passwords or sensitive endpoints.
- Do not hardcode account-specific ECR URLs in shared templates.
- Use AWS Secrets Manager, External Secrets Operator, or Vault for secrets.
- Enable RDS backups.
- Consider Multi-AZ RDS.
- Use least-privilege IAM policies.
- Enable remote Terraform state with locking.
- Add TLS to the Ingress.
- Use a real domain and ACM certificate.
- Add authentication and authorization to the backend.
- Add input validation and request rate limiting.

---

## Current Limitations

The project is intentionally simplified. Current limitations include:

- Backend exam data is in memory.
- Backend does not yet connect to RDS.
- Frontend does not yet call backend APIs.
- No real student authentication.
- No admin panel for creating exams.
- No persistent result storage.
- No Prometheus `/metrics` endpoint yet.
- No real test suite yet.
- Ingress host must be configured before real deployment.
- Grafana password should be externalized.
- Terraform state is local unless backend configuration is enabled.

These limitations are good future enhancement points and can be discussed during a project presentation as planned next steps.

---

## Future Improvements

Recommended next improvements:

1. Connect backend to PostgreSQL.
2. Create database schema for students, exams, questions, attempts, and results.
3. Replace frontend mock data with API calls.
4. Add JWT-based student authentication.
5. Add admin APIs for exam creation and question management.
6. Add unit tests and integration tests.
7. Add `/metrics` endpoint using `prom-client`.
8. Add centralized logging using CloudWatch, Loki, or ELK.
9. Configure TLS on ALB Ingress using ACM.
10. Store Terraform state in S3 with DynamoDB locking.
11. Use External Secrets Operator or AWS Secrets Manager for credentials.
12. Add blue-green or canary deployment strategy.
13. Add database migrations.
14. Add backup and disaster recovery policy.
15. Add cost optimization notes for AWS resources.

---

## Quick Command Reference

Run backend locally:

```bash
cd app
npm install
npm start
```

Run with Docker Compose:

```bash
docker compose up --build
```

Build backend Docker image:

```bash
docker build -t exam-platform-backend:local ./app
```

Provision AWS:

```bash
cd terraform
terraform init
terraform apply -var="db_password=<strong-password>"
```

Connect to EKS:

```bash
aws eks update-kubeconfig --region ap-south-1 --name exam-platform-eks
```

Deploy to Kubernetes:

```bash
kubectl apply -f k8s/
```

Check backend pods:

```bash
kubectl get pods -n exam-platform
```

Install monitoring:

```bash
helm install monitoring prometheus-community/kube-prometheus-stack \
  -n monitoring \
  --create-namespace \
  -f monitoring/monitoring-values.yaml
```

Access Grafana:

```bash
kubectl port-forward -n monitoring svc/monitoring-grafana 3001:80
```

---

## Project Summary

This Online Examination Platform is a complete DevOps project blueprint. It combines a sample exam application with a practical deployment workflow covering source control, CI, containerization, infrastructure provisioning, Kubernetes orchestration, autoscaling, and monitoring.

The current version is suitable for demonstrating DevOps concepts end to end. With database integration, API-backed frontend data, real authentication, metrics instrumentation, and production-grade secret management, it can evolve into a more complete examination platform.
