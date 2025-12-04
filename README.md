# MEAN Stack Receptgyűjtemény - DevOps Projekt

Ez a projekt egy teljeskörű CI/CD pipeline implementációját mutatja be egy konténerizált MEAN stack alkalmazáson. Az alkalmazás lehetővé teszi a felhasználók számára receptek böngészését, létrehozását, értékelését és étrendek összeállítását.

## 🚀 DevOps Eszközök és Technológiák

### Alkalmazás Stack
- **Frontend**: Angular 17, TypeScript, SCSS
- **Backend**: Node.js, Express.js, TypeScript
- **Adatbázis**: MongoDB Atlas (felhő alapú)
- **Autentikáció**: JWT (JSON Web Token)

### DevOps Eszközök
1. **Docker**: Az alkalmazás (Frontend + Backend) egyetlen konténerbe csomagolva (Multi-stage build)
2. **Git**: Verziókezelés és forráskód menedzsment
3. **Jenkins**: CI/CD pipeline vezérlése (Build, Test, Deploy trigger)
4. **Terraform**: Infrastructure as Code - A Render szolgáltatás definíciója
5. **Ansible**: Konfiguráció kezelés - A build környezet ellenőrzése
6. **Render**: Felhő alapú hosting platform
7. **Prometheus**: Monitoring és metrikák gyűjtése

## 📋 CI/CD Pipeline Működése

A kód változása (Git Push) után a Jenkins pipeline automatikusan elindul:

1. **Environment Check (Ansible)**: Ellenőrzi a build környezet állapotát (Docker, Node.js)
2. **Local Build & Test**: Docker image felépítése és tesztelése
3. **Infrastructure (Terraform)**: Az infrastruktúra állapotának ellenőrzése/létrehozása
4. **Deploy to Render**: Webhook-on keresztül frissíti a Render éles környezetét
5. **Monitor Check**: Ellenőrzi az alkalmazás elérhetőségét

## 🏗️ Projekt Struktúra

```
PrfGyak/
├── frontend/           # Angular alkalmazás
│   ├── src/            # Angular forrásfájlok
│   └── ...             # Angular konfigurációs fájlok
├── backend/            # Node.js backend
│   ├── models/         # MongoDB modellek
│   ├── routes/         # API végpontok
│   ├── middleware/     # Middleware-ek (pl. autentikáció)
│   ├── server.js       # Express szerver
│   └── seed.js         # Adatbázis seed script
├── infra/              # Terraform fájlok (IaC)
│   └── main.tf         # Render szolgáltatás definíciója
├── ops/                # Ansible fájlok
│   └── setup.yml       # Környezet ellenőrző playbook
├── Jenkinsfile         # CI/CD Pipeline definíció
├── prometheus.yml      # Monitoring konfiguráció
├── Dockerfile          # Multi-stage Docker build
└── docker-compose.yml  # Lokális fejlesztési környezet
```

## 🌐 Elérhetőség

- **Éles környezet**: https://recept-gyujtemeny.onrender.com
- **Lokális Frontend**: http://localhost:4200
- **Lokális Backend API**: http://localhost:3000

## ✨ Funkciók

- **Felhasználókezelés**: Regisztráció, bejelentkezés, profil kezelése
- **Receptek kezelése**: Receptek létrehozása, szerkesztése, törlése, értékelése
- **Receptek böngészése**: Keresés, szűrés kategória, nehézség és egyéb szempontok szerint
- **Hozzávalók kezelése**: Hozzávalók böngészése, tápanyagtartalom megtekintése
- **Étrendek összeállítása**: Heti étrendek létrehozása, receptek hozzáadása
- **Bevásárlólista generálása**: Automatikus bevásárlólista készítése az étrendek alapján
- **Tápanyagtartalom számítás**: Receptek és étrendek tápanyagtartalmának kiszámítása


## 🛠️ Előfeltételek

### Lokális Fejlesztéshez
- Docker & Docker Compose
- Node.js 20.x (ajánlott: 20.18.3 vagy újabb)
- Angular CLI 17.0.0 (`npm install -g @angular/cli@17.0.0`)

### DevOps Pipeline-hoz
- Jenkins (telepítve és konfigurálva)
- Terraform CLI
- Ansible
- Git
- Render.com fiók (API kulccsal)
- MongoDB Atlas fiók

## 🚀 Telepítés és Indítás

### Lokális Fejlesztési Környezet

1. Klónozd le a repository-t:
```bash
git clone <repository-url>
cd PrfGyak
```

2. Backend indítása Docker-rel:

```bash
# Leállítás és tisztítás (ha már futott korábban)
sudo docker-compose down --remove-orphans -v

# Konténerek indítása
sudo docker-compose down --remove-orphans -v && sudo docker-compose up --build
```

3. Frontend függőségek telepítése és indítása:

```bash
# Jogosultságok beállítása (ha szükséges)
sudo chown -R $USER:$USER ./frontend

# Frontend könyvtárba lépés
cd frontend

# Függőségek telepítése
npm install

# Angular alkalmazás indítása
ng serve
```

4. Seed adatok betöltése (opcionális):

```bash
# Új terminálban
sudo docker exec -it mean-backend node seed.js
```

### DevOps Pipeline Beállítása

#### 1. Render.com Beállítása

1. Regisztrálj a [Render.com](https://render.com) oldalán
2. Menj a **Settings → Account Settings → API Keys** menübe
3. Hozz létre egy új API kulcsot: `terraform-deploy`
4. Mentsd el a kulcsot biztonságos helyre

#### 2. Jenkins Telepítése és Konfigurálása

**Jenkins indítása Docker-ben (minden eszközzel felszerelve):**

```bash
# Jenkins konténer indítása
docker-compose -f jenkins-docker-compose.yml up -d

# Admin jelszó lekérése
docker exec jenkins-devops cat /var/jenkins_home/secrets/initialAdminPassword
```

**Jenkins Initial Setup:**

1. Nyisd meg a böngészőben: `http://localhost:8080`
2. Másold be az admin jelszót (amit az előző parancs kiírt)
3. Válaszd az **"Install suggested plugins"** opciót
4. Hozz létre egy admin felhasználót
5. Telepítsd a **Docker Pipeline** plugint:
   - Manage Jenkins → Manage Plugins → Available
   - Keresd meg: "Docker Pipeline"
   - Telepítsd és indítsd újra a Jenkins-t

**Credentials beállítása:**

1. Menj a **Manage Jenkins → Manage Credentials → (global)** menübe
2. Kattints az **Add Credentials** gombra

**Credential #1: Render API Key**
- Kind: `Secret text`
- Secret: `<A_RENDER_API_KULCSOD>`
- ID: `render-api-key`
- Description: `Render API Key for Terraform`

**Credential #2: Render Deploy Hook**
- Kind: `Secret text`
- Secret: `<RENDER_DEPLOY_HOOK_URL>` (Settings → Deploy Hook a Render Dashboard-on)
- ID: `render-deploy-hook-url`
- Description: `Render Deploy Hook URL`

**Pipeline Job létrehozása:**

1. Jenkins Dashboard → **New Item**
2. Név: `MEAN-App-Pipeline`
3. Típus: **Pipeline** → OK
4. Pipeline szekcióban:
   - Definition: `Pipeline script from SCM`
   - SCM: `Git`
   - Repository URL: `https://github.com/ArmaGedonSx/PrfGyak.git`
   - Branch: `*/main`
   - Script Path: `Jenkinsfile`
5. **Save**

**Pipeline futtatása:**

1. Kattints a **Build Now** gombra
2. Kövesd a build folyamatát a **Console Output**-ban
3. Ha minden zöld, az alkalmazás elérhető a Render URL-en! 🎉

#### 3. Terraform Inicializálás

```bash
cd infra
terraform init
terraform plan -var="render_api_key=YOUR_API_KEY" -var="owner_id=YOUR_OWNER_ID"
terraform apply -var="render_api_key=YOUR_API_KEY" -var="owner_id=YOUR_OWNER_ID"
```

#### 4. Monitoring (Prometheus)

```bash
# Prometheus letöltése és futtatása
prometheus --config.file=prometheus.yml
```

Prometheus UI: http://localhost:9090

## 📡 API Végpontok

### Autentikáció
- `POST /api/auth/register` - Regisztráció
- `POST /api/auth/login` - Bejelentkezés
- `GET /api/auth/profile` - Felhasználói profil lekérése

### Receptek
- `GET /api/recipes` - Receptek listázása
- `GET /api/recipes/:id` - Recept részleteinek lekérése
- `POST /api/recipes` - Új recept létrehozása
- `PUT /api/recipes/:id` - Recept szerkesztése
- `DELETE /api/recipes/:id` - Recept törlése
- `POST /api/recipes/:id/rate` - Recept értékelése
- `POST /api/recipes/:id/favorite` - Recept hozzáadása a kedvencekhez
- `DELETE /api/recipes/:id/favorite` - Recept eltávolítása a kedvencekből

### Hozzávalók
- `GET /api/ingredients` - Hozzávalók listázása
- `GET /api/ingredients/:id` - Hozzávaló részleteinek lekérése
- `POST /api/ingredients` - Új hozzávaló létrehozása
- `PUT /api/ingredients/:id` - Hozzávaló szerkesztése
- `DELETE /api/ingredients/:id` - Hozzávaló törlése

### Étrendek
- `GET /api/mealplans` - Étrendek listázása
- `GET /api/mealplans/:id` - Étrend részleteinek lekérése
- `POST /api/mealplans` - Új étrend létrehozása
- `PUT /api/mealplans/:id` - Étrend szerkesztése
- `DELETE /api/mealplans/:id` - Étrend törlése
- `GET /api/mealplans/:id/shopping-list` - Bevásárlólista generálása
- `GET /api/mealplans/:id/nutrition` - Tápanyagtartalom számítása

## 🗄️ MongoDB Atlas

A projekt MongoDB Atlas-t használ a lokális MongoDB helyett. Ez lehetővé teszi, hogy:
- Minden fejlesztői környezet ugyanazt az adatbázist használja
- Nincs szükség lokális MongoDB telepítésre vagy konténerre
- Az adatok automatikusan szinkronban vannak a különböző környezetek között

### MongoDB Atlas beállítása (ha még nem tetted meg)

1. **Regisztráció és bejelentkezés**:
   - Látogass el a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) oldalára
   - Regisztrálj egy ingyenes fiókot vagy jelentkezz be

2. **Új klaszter létrehozása**:
   - Kattints a "Build a Cluster" gombra
   - Válaszd az ingyenes "Shared" opciót
   - Válassz egy cloud providert és régiót
   - Kattints a "Create Cluster" gombra

3. **Adatbázis-hozzáférés beállítása**:
   - A bal oldali menüben válaszd a "Database Access" opciót
   - Kattints az "Add New Database User" gombra
   - Adj meg egy felhasználónevet és jelszót
   - Állítsd be a megfelelő jogosultságokat

4. **Hálózati hozzáférés beállítása**:
   - A bal oldali menüben válaszd a "Network Access" opciót
   - Kattints az "Add IP Address" gombra
   - Fejlesztéshez választhatod a "Allow Access from Anywhere" opciót

5. **Kapcsolódási string megszerzése**:
   - A klaszter oldalán kattints a "Connect" gombra
   - Válaszd a "Drivers" opciót (Connect to your application)
   - Válaszd a "Node.js" drivert
   - Másold ki a kapcsolódási string-et

### Kapcsolódási string használata

A kapcsolódási string-et a `docker-compose.yml` fájlban kell beállítani:

```yaml
environment:
  - MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority&appName=<appname>
```

Fontos: A MongoDB Atlas kapcsolódási string formátuma `mongodb+srv://` protokollt használ, nem pedig `mongodb://` protokollt. Ez a különbség fontos a sikeres kapcsolódáshoz.

## 💻 Fejlesztés

### Frontend Fejlesztés
- A forrásfájlok a `frontend/src` könyvtárban találhatók
- A változtatások automatikusan érvénybe lépnek az Angular fejlesztői szerveren
- Új komponensek létrehozása:
  ```bash
  cd frontend
  ng generate component my-component
  ```
- Új service létrehozása:
  ```bash
  cd frontend
  ng generate service my-service
  ```

### Backend Fejlesztés
- A backend fájlok a `backend` könyvtárban találhatók
- A változtatások a Docker kötet miatt automatikusan szinkronizálódnak a konténerrel
- Az Express szerver újraindításához:
  ```bash
  sudo docker restart mean-backend
  ```
- Seed adatok betöltése:
  ```bash
  sudo docker exec -it mean-backend node seed.js
  ```

## 🧪 Tesztelés

### Backend API tesztelése
- Használhatod a Postman vagy Insomnia alkalmazásokat az API végpontok teszteléséhez
- Példa kérés:
  ```
  GET http://localhost:3000/api/recipes
  ```

### Frontend tesztelése
- Nyisd meg a böngészőben: http://localhost:4200
- Jelentkezz be a következő felhasználóval:
  - Email: admin@example.com
  - Jelszó: admin123

## 🔧 Hibaelhárítás

### MongoDB kapcsolódási problémák
- Ellenőrizd, hogy a MongoDB Atlas kapcsolódási string helyes-e
- Ellenőrizd, hogy a hálózati hozzáférés engedélyezve van-e a jelenlegi IP címről
- Ellenőrizd a MongoDB Atlas dashboard-on a klaszter állapotát

### Docker problémák
- Ellenőrizd a Docker logokat:
  ```bash
  sudo docker-compose logs -f
  ```
- Újraindítás tiszta állapotból:
  ```bash
  sudo docker-compose down --remove-orphans -v && sudo docker-compose up --build
  ```
- Ha "orphan containers" hibát kapsz:
  ```bash
  sudo docker stop $(sudo docker ps -a -q)
  sudo docker rm $(sudo docker ps -a -q)
  ```

### Frontend fejlesztési problémák
- Jogosultsági problémák esetén:
  ```bash
  sudo chown -R $USER:$USER ./frontend
  ```
- Ha npm telepítési hibákat tapasztalsz:
  ```bash
  rm -rf frontend/node_modules
  rm -f frontend/package-lock.json
  cd frontend && npm install
  ```
- Angular CLI hibák esetén:
  ```bash
  npm install -g @angular/cli@17.0.0
  ```
