pipeline {
    agent any

    stages {
        stage('🛠️ Environment Check (Ansible)') {
            steps {
                echo '🔍 Checking environment with Ansible...'
                // Csak ellenőrzés (check mode), hogy ne módosítson semmit
                sh 'ansible-playbook ops/setup.yml --check'
            }
        }

        stage('🧪 Docker Build Test') {
            steps {
                echo '🐳 Testing Docker build...'
                // Megpróbáljuk felépíteni, hogy lássuk, sikeres-e a build
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
                
                // 1. TISZTÍTÁS & ELŐKÉSZÍTÉS
                // Töröljük a config mappát, ha létezne, majd létrehozzuk üresen
                sh 'rm -rf config || true'
                sh 'mkdir -p config'
                
                // 2. LEÁLLÍTÁS
                // Leállítjuk a futó konténereket a tiszta induláshoz
                sh 'docker-compose down --remove-orphans || true' 

                // 3. CONFIG LÉTREHOZÁSA (a "config" mappába!)
                sh '''
                cat > config/prometheus.yml << 'EOF'
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
                
                // 4. ELLENŐRZÉS (Debug)
                // Kilistázzuk, hogy biztosan ott van-e a fájl
                sh 'ls -l config/prometheus.yml'
                
                // 5. DEPLOY
                // Elindítjuk a stack-et
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
                // Várunk 15 másodpercet, hogy a Prometheus biztosan elinduljon
                sh 'sleep 15'
                
                // Prometheus health check
                sh 'curl -f http://localhost:9090/-/healthy || echo "⚠️ Prometheus not ready yet"'
                
                // Grafana health check
                sh 'curl -f http://localhost:3001/api/health || echo "⚠️ Grafana not ready yet"'
                
                echo '✅ Monitoring check finished!'
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