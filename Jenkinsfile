pipeline {
    agent any

    environment {
        AWS_REGION      = 'ap-south-1'
        ECR_REPO        = '<ECR_REPO_URL>'        // from terraform output
        IMAGE_TAG       = "${env.BUILD_NUMBER}"
        EKS_CLUSTER     = 'exam-platform-eks'
        K8S_NAMESPACE   = 'exam-platform'
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/<your-username>/exam-platform.git'
            }
        }

        stage('Install & Test') {
            steps {
                dir('app') {
                    sh 'npm install'
                    sh 'npm test'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                dir('app') {
                    sh "docker build -t ${ECR_REPO}:${IMAGE_TAG} ."
                    sh "docker tag ${ECR_REPO}:${IMAGE_TAG} ${ECR_REPO}:latest"
                }
            }
        }

        stage('Push to ECR') {
            steps {
                sh """
                    aws ecr get-login-password --region ${AWS_REGION} | \
                    docker login --username AWS --password-stdin ${ECR_REPO}
                    docker push ${ECR_REPO}:${IMAGE_TAG}
                    docker push ${ECR_REPO}:latest
                """
            }
        }

        stage('Deploy to EKS') {
            steps {
                sh """
                    aws eks update-kubeconfig --region ${AWS_REGION} --name ${EKS_CLUSTER}
                    kubectl set image deployment/exam-backend exam-backend=${ECR_REPO}:${IMAGE_TAG} -n ${K8S_NAMESPACE}
                    kubectl rollout status deployment/exam-backend -n ${K8S_NAMESPACE}
                """
            }
        }
    }

    post {
        success {
            echo "Deployment successful: build ${IMAGE_TAG}"
        }
        failure {
            echo "Pipeline failed. Check logs above."
        }
    }
}
