# Docker MEAN Stack Project

Ez a projekt egy MEAN (MongoDB, Express.js, Angular, Node.js) stack alkalmazás Docker környezetben.

## Előfeltételek

- Docker
- Docker Compose

Nincs szükség Node.js, MongoDB vagy egyéb függőségek lokális telepítésére, minden a Docker konténerekben fut.

## Projekt Struktúra

```
Angular-project/
├── frontend/          # Angular alkalmazás
│   └── src/          # Angular forrásfájlok
├── backend/          
│   ├── package.json  # Node.js függőségek
│   └── server.js     # Express szerver
├── Dockerfile        # Docker konfiguráció
└── docker-compose.yml # Docker Compose konfiguráció
```

## Telepítés és Indítás

1. Klónozd le a repository-t:
```bash
git clone <repository-url>
cd Angular-project
```

2. Indítsd el a konténereket:
```bash
sudo docker-compose up --build
```

A build folyamat:
1. Létrehozza a MongoDB konténert
2. Felépíti az Angular projektet:
   - Routing engedélyezve
   - SCSS stílusok
   - API proxy konfiguráció
3. Telepíti az összes függőséget
4. Elindítja a szervereket

## Elérhetőség

- Frontend: http://localhost:4200
- Backend API: http://localhost:3000
- MongoDB: mongodb://localhost:27017

## Fejlesztés

### Frontend Fejlesztés
- A forrásfájlok a `frontend/src` könyvtárban találhatók
- A változtatások automatikusan érvénybe lépnek
- Új komponensek létrehozása:
  ```bash
  sudo docker exec mean-stack ng generate component my-component
  ```
- Új service létrehozása:
  ```bash
  sudo docker exec mean-stack ng generate service my-service
  ```

### Backend Fejlesztés
- A backend fájlok a `backend` könyvtárban találhatók
- A változtatások automatikusan érvénybe lépnek
- Az Express szerver újraindul a változtatások után

## Docker Parancsok

### Konténerek leállítása:
```bash
sudo docker-compose down
```

### Konténerek leállítása és adatok törlése:
```bash
sudo docker-compose down -v
```

### Logok megtekintése:
```bash
sudo docker-compose logs -f
```

## Megjegyzések

- A Docker parancsokhoz sudo jogosultság szükséges Linux rendszereken
- Ha nem szeretnéd használni a sudo-t, add hozzá a felhasználót a docker csoporthoz:
  ```bash
  sudo usermod -aG docker $USER
  # Jelentkezz ki és be a változtatások érvénybe lépéséhez
