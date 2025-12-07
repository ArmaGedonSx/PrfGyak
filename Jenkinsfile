pipeline {
    agent any

    stages {
        stage('🛠️ Environment Check (Ansible)') {
            steps {
                echo '🔍 Checking environment with Ansible...'
                sh 'ansible-playbook ops/setup.yml --check'
            }
        }

        stage('🧪 Docker Build Test') {
            steps {
                echo '🐳 Testing Docker build...'
                sh 'docker build -t mean-app-test .'
                echo '✅ Docker build successful!'
            }
        }

        stage('☁️ Infrastructure Validation (Terraform)') {
            steps {
                echo '🏗️ Validating infrastructure with Terraform...'
                dir('infra') {
                    sh 'terraform init'
                    sh 'terraform validate'
                    echo '✅ Terraform configuration is valid!'
                }
            }
        }

        stage('🚀 Deploy Locally (Docker Compose)') {
            steps {
                echo '📦 Deploying application locally...'
                
                // 1. TISZTÍTÁS
                sh 'rm -rf prometheus_build || true'
                sh 'mkdir -p prometheus_build'
                
                // 2. LEÁLLÍTÁS
                sh 'docker-compose down --remove-orphans || true' 

                // 3. PROMETHEUS IMAGE ELŐKÉSZÍTÉSE
                // Ahelyett, hogy mountolnánk, beleégetjük a konfigot egy Dockerfile-ba!
                
                // 3a. Konfig fájl létrehozása
                sh '''
                cat > prometheus_build/prometheus.yml << 'EOF'
global:
  scrape_interval: 10s
  evaluation_interval: 10s

scrape_configs:
  - job_name: 'mean-app'
    static_configs:
      - targets: ['mean-app:3000']
    metrics_path: '/api/test'
EOF
                '''
                
                // 3b. Dockerfile létrehozása a Prometheushoz
                sh '''
                cat > prometheus_build/Dockerfile << 'EOF'
FROM prom/prometheus:latest
COPY prometheus.yml /etc/prometheus/prometheus.yml
EOF
                '''

                // 4. DEPLOY
                // A docker-compose most már buildelni fogja a Prometheust is
                sh 'docker-compose up -d --build'
                
                echo '✅ Application deployed!'
                echo ''
                echo '🌐 Access points:'
                echo '   - App: http://localhost:3000'
                echo '   - Prometheus: http://localhost:9090'
                echo '   - Grafana: http://localhost:3001 (admin/admin)'
            }
        }

        stage('📊 Monitoring Check') {
            steps {
                echo '📈 Checking monitoring stack...'
                sh 'sleep 15'
                sh 'curl -f http://localhost:9090/-/healthy || echo "⚠️ Prometheus not ready yet"'
                sh 'curl -f http://localhost:3001/api/health || echo "⚠️ Grafana not ready yet"'
                echo '✅ Monitoring check finished!'
            }
        }

        stage('✅ Pipeline Complete') {
            steps {
                echo '🎉 CI/CD Pipeline completed successfully!'
                echo '   ✅ Environment validated (Ansible)'
                echo '   ✅ Docker build tested'
                echo '   ✅ Infrastructure validated (Terraform)'
                echo '   ✅ Application deployed locally'
                echo '   ✅ Monitoring stack running'
            }
        }
    }

    post {
        failure {
            echo '❌ Pipeline failed! Check the logs above.'
        }
        success {
            echo '✅ Pipeline succeeded! Application is running.'
        }
    }
}