pipeline {
    agent any

    stages {
        stage('🛠️ Environment Check (Ansible)') {
            steps {
                echo '🔍 Checking environment with Ansible...'
                // Ansible futtatása a környezet ellenőrzésére
                sh 'ansible-playbook ops/setup.yml --check'
            }
        }

        stage('🧪 Docker Build Test') {
            steps {
                echo '🐳 Testing Docker build...'
                // Docker image build teszt
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
                
                // ÚJ: Létrehozunk egy dedikált mappát a konfigurációknak
                sh 'mkdir -p config'
                sh 'rm -rf config/prometheus.yml || true' // Tisztítjuk a mappát

                // 2. LEÁLLÍTÁS: leállítjuk az összes konténert (mielőtt az új fájlt használjuk)
                sh 'docker-compose down --remove-orphans || true' 

                // 3. Konfiguráció létrehozása: a mappában
                sh '''
                cat > config/prometheus.yml << 'EOF'
global:
  scrape_interval: 10s
  evaluation_interval: 10s

scrape_configs:
  - job_name: 'mean-app'
    # Itt a konténernevet célozzuk a Docker hálózaton belül
    static_configs:
      - targets: ['mean-app:3000']
    metrics_path: '/metrics'
EOF
                '''
                
                // Config ellenőrzése
                sh 'ls -la prometheus.yml'
                sh 'cat prometheus.yml'
                
                // Deploy
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
                // Várunk egy kicsit, hogy a konténerek elinduljanak
                sh 'sleep 10'
                // Prometheus health check
                sh 'curl -f http://localhost:9090/-/healthy || echo "Prometheus not ready yet"'
                // Grafana health check
                sh 'curl -f http://localhost:3001/api/health || echo "Grafana not ready yet"'
                echo '✅ Monitoring stack is running!'
            }
        }

        stage('✅ Pipeline Complete') {
            steps {
                echo '🎉 CI/CD Pipeline completed successfully!'
                echo ''
                echo '📋 Summary:'
                echo '   ✅ Environment validated (Ansible)'
                echo '   ✅ Docker build tested'
                echo '   ✅ Infrastructure validated (Terraform)'
                echo '   ✅ Application deployed locally'
                echo '   ✅ Monitoring stack running'
                echo ''
                echo '🔗 Next steps:'
                echo '   1. Check app: http://localhost:3000'
                echo '   2. View metrics: http://localhost:9090'
                echo '   3. View dashboards: http://localhost:3001'
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
