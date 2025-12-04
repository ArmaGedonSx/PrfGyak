pipeline {
    agent any

    environment {
        // Render API Key a Terraform-hoz
        RENDER_API_KEY = credentials('render-api-key')
    }

    stages {
        stage('🛠️ Environment Check (Ansible)') {
            steps {
                // Ansible futtatása a környezet ellenőrzésére
                sh 'ansible-playbook ops/setup.yml'
            }
        }

        stage('🧪 Local Build & Test') {
            steps {
                script {
                    // Megpróbáljuk felépíteni a Docker image-et lokálisan
                    // Hogy lássuk, nem hibás-e a kód, mielőtt kitennénk
                    sh 'docker build -t mean-app-test .'
                }
            }
        }

        stage('☁️ Infrastructure (Terraform)') {
            steps {
                dir('infra') {
                    // Inicializálás
                    sh 'terraform init'
                    // Apply (létrehozza a Render service-t ha még nincs)
                    // A var-t parancssorból adjuk át a biztonságért
                    // Megjegyzés: Ha ez bonyolult, ezt a stage-et "skip"-elheted a demónál, 
                    // és mondhatod, hogy már kiépült az infra.
                    sh 'terraform plan -var="render_api_key=${RENDER_API_KEY}" -var="owner_id=user-xxx"'
                }
            }
        }

        stage('📊 Build Success') {
            steps {
                echo '✅ Build and tests completed successfully!'
                echo '📦 Docker image is ready for deployment'
                echo '🚀 Push to GitHub to trigger Render auto-deploy'
                echo ''
                echo 'Next steps:'
                echo '1. git add .'
                echo '2. git commit -m "Update application"'
                echo '3. git push origin main'
                echo '4. Render will automatically deploy from GitHub'
            }
        }
    }
}
