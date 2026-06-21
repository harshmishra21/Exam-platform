# Online Examination Platform — DevOps Project

End-to-end DevOps setup: **GitHub → Jenkins → Docker → Terraform → AWS (EC2/EKS) → Kubernetes → Prometheus/Grafana**

> Note: Vault (secrets management) is intentionally excluded from this build.
> A Kubernetes Secret placeholder is used instead — see `k8s/namespace-and-secret.yaml`.

---

## Folder Structure

```
exam-platform/
├── app/                      # Sample Node.js backend (replace with your real app)
│   ├── server.js
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml        # Local testing (app + Postgres)
├── terraform/                # AWS infra as code
│   ├── main.tf
│   ├── variables.tf
│   ├── vpc.tf
│   ├── eks.tf
│   ├── rds_s3.tf
│   └── outputs.tf
├── k8s/                      # Kubernetes manifests
│   ├── namespace-and-secret.yaml
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   └── hpa.yaml
├── monitoring/                # Prometheus + Grafana
│   ├── monitoring-values.yaml
│   ├── servicemonitor.yaml
│   └── dashboards/exam-backend-dashboard.json
├── Jenkinsfile
└── .github/workflows/ci.yml
```

---

## Step 1 — GitHub Setup

1. Create a new repo (e.g. `exam-platform`) and push this folder to it.
2. Go to **Settings → Branches → Add branch protection rule** for `main`:
   - Require pull request before merging
   - Require status checks to pass (the `ci.yml` workflow)
   - Require at least 1 approval
3. The `.github/workflows/ci.yml` will auto-run npm install/test/docker build on every PR.

```bash
git init
git add .
git commit -m "Initial commit: exam platform DevOps setup"
git remote add origin https://github.com/<your-username>/exam-platform.git
git push -u origin main
```

---

## Step 2 — Test Locally with Docker

```bash
cd exam-platform
docker compose up --build
# Visit http://localhost:3000
```

---

## Step 3 — Provision AWS Infra with Terraform

Prerequisites: AWS CLI configured (`aws configure`) with an IAM user that has admin/programmatic access.

```bash
cd terraform
terraform init
terraform plan -var="db_password=<choose-a-strong-password>"
terraform apply -var="db_password=<choose-a-strong-password>"
```

This creates: VPC (public+private subnets), EKS cluster + managed node group (runs on EC2 instances), RDS Postgres, S3 bucket, ECR repository, IAM roles.

Note the outputs — you'll need `ecr_repository_url`, `eks_cluster_name`, and `rds_endpoint` in later steps.

---

## Step 4 — Connect to the EKS Cluster

```bash
aws eks update-kubeconfig --region ap-south-1 --name exam-platform-eks
kubectl get nodes
```

---

## Step 5 — Deploy to Kubernetes

```bash
# Create namespace and secret first (replace RDS endpoint)
kubectl apply -f k8s/namespace-and-secret.yaml

# Update k8s/deployment.yaml -> replace <ECR_REPO_URL> with terraform output value
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml

kubectl get pods -n exam-platform
```

---

## Step 6 — Jenkins CI/CD

1. Launch an EC2 instance (or run Jenkins as a container) and install Jenkins.
2. Install plugins: Docker, AWS Steps, Kubernetes CLI, Git.
3. Create a new Pipeline job → point it to this repo → it will read the `Jenkinsfile` automatically.
4. Add AWS credentials in Jenkins (Manage Jenkins → Credentials) with ECR/EKS push/deploy permissions.
5. Add a GitHub Webhook (repo Settings → Webhooks) pointing to `http://<jenkins-ip>:8080/github-webhook/` so every push auto-triggers the pipeline.
6. Replace `<ECR_REPO_URL>` and GitHub repo URL placeholders inside `Jenkinsfile`.

Now every push to `main` will: checkout → test → build Docker image → push to ECR → deploy to EKS.

---

## Step 7 — Prometheus + Grafana Monitoring

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm install monitoring prometheus-community/kube-prometheus-stack \
  -n monitoring --create-namespace \
  -f monitoring/monitoring-values.yaml

kubectl apply -f monitoring/servicemonitor.yaml

# Access Grafana
kubectl port-forward -n monitoring svc/monitoring-grafana 3001:80
# Visit http://localhost:3001 (user: admin, password: from monitoring-values.yaml)
```

The pre-built dashboard (`dashboards/exam-backend-dashboard.json`) shows CPU, memory, request rate, and pod count for the exam-backend service.

---

## Step 8 — Validate Everything

- [ ] `kubectl get pods -n exam-platform` → pods Running
- [ ] `kubectl get hpa -n exam-platform` → autoscaler active
- [ ] Push a code change to `main` → Jenkins pipeline triggers automatically
- [ ] Grafana dashboard shows live metrics
- [ ] Load test the app (e.g. `k6` or `ab`) and watch HPA scale pods up

---

## What's Intentionally Skipped

- **HashiCorp Vault** — secrets management is simplified to a Kubernetes Secret for this build. If you add it back later, Vault would replace the static Secret in `k8s/namespace-and-secret.yaml` with dynamically injected secrets via the Vault Agent Injector.
test
