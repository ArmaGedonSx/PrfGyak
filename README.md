# MEAN Stack Receptgyűjtemény - DevOps Projekt

Ez a projekt egy teljeskörű CI/CD pipeline implementációját mutatja be egy konténerizált MEAN stack alkalmazáson, Docker Compose orchestration-nel és teljes monitoring stack-kel (Prometheus + Grafana).

## 🚀 DevOps Eszközök és Technológiák

### Alkalmazás Stack
- **Frontend**: Angular 17, TypeScript, SCSS
- **Backend**: Node.js, Express.js
- **Adatbázis**: MongoDB Atlas (felhő alapú)
- **Autentikáció**: JWT (JSON Web Token), bcryptjs

### DevOps Eszközök
1. **Docker**: Multi-stage build (Frontend + Backend egyetlen konténerben)
2. **Docker Compose**: Orchestration (App + Monitoring stack)
3. **Git**: Verziókezelés és forráskód menedzsment
4. **Jenkins**: CI/CD pipeline automatizálás
5. **Terraform**: Infrastructure as Code - Infrastruktúra validáció
6. **Ansible**: Configuration Management - Build környezet ellenőrzés
7. **Prometheus**: Metrics collection és monitoring
8. **Grafana**: Metrics visualization és dashboards

## 📋 CI/CD Pipeline Működése

```
┌─────────────────────────────────────────────────────────────┐
│                    Git Push → GitHub                        │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│              Jenkins Pipeline (Automatikus)                 │
├─────────────────────────────────────────────────────────────┤
│  Stage 1: 🛠️ Environment Check (Ansible)                    │
│  - Docker telepítve és fut?                                  │
│  - Node.js megfelelő verzió?                                 │
│  - Szükséges eszközök elérhetők?                             │
├─────────────────────────────────────────────────────────────┤
│  Stage 2: 🧪 Docker Build Test                              │
│  - Docker image build teszt                                  │
│  - Build hibák észlelése                                     │
│  - Image létrehozása: mean-app-test                          │
├─────────────────────────────────────────────────────────────┤
│  Stage 3: ☁️ Infrastructure Validation (Terraform)          │
│  - terraform init                                            │
│  - terraform validate                                        │
│  - Infrastruktúra konfiguráció ellenőrzése                   │
├─────────────────────────────────────────────────────────────┤
│  Stage 4: 🚀 Deploy Locally (Docker Compose)                │
│  - docker-compose down (régi konténerek leállítása)         │
│  - docker-compose up -d --build (új build és indítás)       │
│  - mean-app, prometheus, grafana indítása                    │
├─────────────────────────────────────────────────────────────┤
│  Stage 5: 📊 Monitoring Check                               │
│  - Prometheus health check (localhost:9090)                  │
│  - Grafana health check (localhost:3001)                     │
│  - Monitoring stack működésének ellenőrzése                  │
├─────────────────────────────────────────────────────────────┤
│  ✅ Pipeline Complete!                                       │
│  - Alkalmazás fut: http://localhost:3000                     │
│  - Prometheus: http://localhost:9090                         │
│  - Grafana: http://localhost:3001                            │
└─────────────────────────────────────────────────────────────┘
```

## 🏗️ Deployment Architektúra

```
┌─────────────────────────────────────────────────────────────┐
│                  Docker Compose Stack                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  mean-app (localhost:3000)                         │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │  Frontend: Angular (built-in /public)        │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │  Backend: Node.js + Express                  │  │    │
│  │  │  - API Routes                                │  │    │
│  │  │  - JWT Auth                                  │  │    │
│  │  │  - /metrics endpoint (Prometheus)            │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  │           ↓                                         │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │  MongoDB Atlas (Cloud)                       │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────┘    │
│                       ↑                                      │
│                       │ scrapes /metrics                     │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Prometheus (localhost:9090)                       │    │
│  │  - Metrics collection (10s interval)               │    │
│  │  - Time-series database                            │    │
│  │  - Targets: mean-app:3000/metrics                  │    │
│  └────────────────────────────────────────────────────┘    │
│                       ↑                                      │
│                       │ data source                          │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Grafana (localhost:3001)                          │    │
│  │  - Dashboards & Visualization                      │    │
│  │  - Data Source: Prometheus                         │    │
│  │  - Login: admin/admin                              │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Monitoring és Metrics

### Prometheus Metrics Endpoint
Az alkalmazás `/metrics` endpointon szolgáltatja ki a metrikákat:

**Elérhető Metrics:**
- `http_requests_total` - HTTP kérések száma (method, route, status_code label-ekkel)
- `http_request_duration_seconds` - HTTP kérések időtartama
- `nodejs_heap_size_used_bytes` - Node.js heap memória használat
- `process_cpu_user_seconds_total` - CPU használat
- `nodejs_version_info` - Node.js verzió információ

**Prometheus Konfiguráció:**
```yaml
scrape_configs:
  - job_name: 'mean-app'
    scrape_interval: 10s
    static_configs:
      - targets: ['mean-app:3000']
```

### Grafana Dashboards

**Data Source Beállítás:**
1. Grafana megnyitása: http://localhost:3001
2. Login: `admin` / `admin`
3. Configuration → Data Sources → Add data source
4. Prometheus kiválasztása
5. URL: `http://prometheus:9090`
6. Save & Test

**Hasznos Metrikák Vizualizáláshoz:**
- HTTP kérések száma időben: `rate(http_requests_total[5m])`
- Átlagos válaszidő: `rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])`
- Memory használat: `nodejs_heap_size_used_bytes / 1024 / 1024` (MB-ban)

## 🌐 Elérhetőség

### Lokális Környezet
- **Alkalmazás**: http://localhost:3000
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin)
- **Jenkins**: http://localhost:8080
- **Metrics Endpoint**: http://localhost:3000/metrics

## ✨ Funkciók

- **Felhasználókezelés**: Regisztráció, bejelentkezés, profil kezelése
- **Receptek kezelése**: Receptek létrehozása, szerkesztése, törlése, értékelése
- **Receptek böngészése**: Keresés, szűrés kategória, nehézség szerint
- **Hozzávalók kezelése**: Hozzávalók böngészése, tápanyagtartalom
- **Étrendek összeállítása**: Heti étrendek létrehozása
- **Bevásárlólista generálása**: Automatikus bevásárlólista
- **Admin Dashboard**: Felhasználók és tartalom kezelése

## 🛠️ Előfeltételek

- **Docker** & **Docker Compose** (v2.0+)
- **Node.js** 20.x
- **Git**
- **MongoDB Atlas** fiók (ingyenes tier)

## 🚀 Gyors Indítás

### 1. Klónozás és Környezeti Változók

```bash
git clone https://github.com/ArmaGedonSx/PrfGyak.git
cd PrfGyak

# .env fájl létrehozása
echo "MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/" > .env
```

### 2. Jenkins Indítása

```bash 
# Jenkins konténer indítása
docker-compose -f jenkins-docker-compose.yml up -d

# Admin jelszó lekérése
docker exec jenkins-devops cat /var/jenkins_home/secrets/initialAdminPassword

# Jenkins: http://localhost:8080
```

### 3. Jenkins Pipeline Beállítása

1. **Initial Setup:**
   - http://localhost:8080
   - Admin jelszó beillesztése
   - "Install suggested plugins"

2. **Pipeline Job:**
   - New Item → `MEAN-App-Pipeline` → Pipeline
   - Definition: `Pipeline script from SCM`
   - SCM: `Git`
   - Repository: `https://github.com/ArmaGedonSx/PrfGyak.git`
   - Branch: `*/main`
   - Script Path: `Jenkinsfile`
   - Save

3. **Build Now** → Pipeline fut!

### 4. Alkalmazás Elérése

```bash
# Alkalmazás
http://localhost:3000

# Prometheus
http://localhost:9090

# Grafana
http://localhost:3001
```

## 🔧 Manuális Deployment (Jenkins Nélkül)

```bash
# Build és indítás
docker-compose up -d --build

# Logok követése
docker-compose logs -f mean-app

# Seed adatok (opcionális)
docker exec -it mean-app node seed.js
```

## 📡 API Végpontok

### Autentikáció
- `POST /api/auth/register` - Regisztráció
- `POST /api/auth/login` - Bejelentkezés
- `GET /api/auth/profile` - Profil lekérése

### Receptek
- `GET /api/recipes` - Receptek listázása
- `GET /api/recipes/:id` - Recept részletei
- `POST /api/recipes` - Új recept (auth)
- `PUT /api/recipes/:id` - Recept szerkesztése (auth)
- `DELETE /api/recipes/:id` - Recept törlése (auth)

### Monitoring
- `GET /metrics` - Prometheus metrics

## 🗄️ MongoDB Atlas Beállítása

1. **Regisztráció**: https://www.mongodb.com/cloud/atlas
2. **Cluster**: Free Shared Cluster
3. **Database User**: Username + Password
4. **Network Access**: Allow Access from Anywhere
5. **Connection String**: 
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/
   ```
6. **.env**: `MONGO_URI=<connection_string>`

## 🧪 Tesztelés

### Seed Felhasználók

```
Admin:
- Email: admin@example.com
- Password: admin123

Vegetáriánus:
- Email: vegetarian@example.com
- Password: password123
```

## 🔧 Hibaelhárítás

### Docker Problémák

```bash
# Logok
docker-compose logs -f

# Újraindítás
docker-compose down -v
docker-compose up -d --build
```

### Prometheus/Grafana

```bash
# Health checks
curl http://localhost:9090/-/healthy
curl http://localhost:3001/api/health

# Targets ellenőrzése
# http://localhost:9090/targets
```

## 📚 Dokumentáció

- **Angular**: https://angular.io/docs
- **Express.js**: https://expressjs.com/
- **Docker**: https://docs.docker.com/
- **Jenkins**: https://www.jenkins.io/doc/
- **Prometheus**: https://prometheus.io/docs/
- **Grafana**: https://grafana.com/docs/

## 👨‍💻 Projekt

**DevOps Gyakorlat** - MEAN Stack CI/CD Pipeline + Monitoring
