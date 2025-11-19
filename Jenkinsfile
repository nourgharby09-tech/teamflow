pipeline {
    agent any

    environment {
        DOCKERHUB_USER = 'nourgharby'

        IMAGE_EMP   = 'teamflow-employee'
        IMAGE_PAY   = 'teamflow-payroll'
        IMAGE_DEP   = 'teamflow-department'
        IMAGE_FRONT = 'teamflow-frontend'
    }

    stages {

        stage('Checkout') {
            steps {
                echo "Cloning TeamFlow repository..."
                git branch: 'main', url: 'https://github.com/nourgharby09-tech/teamflow.git'
            }
        }

        stage('Build Docker Images') {
    steps {
        sh "docker build -t ${DOCKERHUB_USER}/${IMAGE_EMP}:latest microservices/employee"
        sh "docker build -t ${DOCKERHUB_USER}/${IMAGE_PAY}:latest microservices/payroll"
        sh "docker build -t ${DOCKERHUB_USER}/${IMAGE_DEP}:latest microservices/department"
        sh "docker build -t ${DOCKERHUB_USER}/${IMAGE_FRONT}:latest teamflow-react-frontend"
    }
}

        stage('Login to Docker Hub') {
            steps {
                echo "Logging to DockerHub..."
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'USER',
                    passwordVariable: 'PASS'
                )]) {
                    sh 'echo "$PASS" | docker login -u "$USER" --password-stdin'
                }
            }
        }

        stage('Push Docker Images') {
            steps {
                echo "Pushing images to Docker Hub..."

                sh "docker push ${DOCKERHUB_USER}/${IMAGE_EMP}:latest"
                sh "docker push ${DOCKERHUB_USER}/${IMAGE_PAY}:latest"
                sh "docker push ${DOCKERHUB_USER}/${IMAGE_DEP}:latest"
                sh "docker push ${DOCKERHUB_USER}/${IMAGE_FRONT}:latest"
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                echo "Applying Kubernetes manifests..."

                sh "kubectl apply -f k8s/employee/"
                sh "kubectl apply -f k8s/payroll/"
                sh "kubectl apply -f k8s/department/"
                sh "kubectl apply -f k8s/frontend/"
            }
        }

    }

    post {
        success {
            echo "✔ TEAMFLOW CI/CD Pipeline executed successfully!"
        }
        failure {
            echo "✖ Pipeline failed! Check logs."
        }
    }
}
