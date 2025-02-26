# Receptgyűjtemény és Ételtervező Alkalmazás

Ez a projekt egy MEAN (MongoDB, Express.js, Angular, Node.js) stack alkalmazás, amely lehetővé teszi a felhasználók számára receptek böngészését, létrehozását, értékelését és étrendek összeállítását.

## Funkciók

- **Felhasználókezelés**: Regisztráció, bejelentkezés, profil kezelése
- **Receptek kezelése**: Receptek létrehozása, szerkesztése, törlése, értékelése
- **Receptek böngészése**: Keresés, szűrés kategória, nehézség és egyéb szempontok szerint
- **Hozzávalók kezelése**: Hozzávalók böngészése, tápanyagtartalom megtekintése
- **Étrendek összeállítása**: Heti étrendek létrehozása, receptek hozzáadása
- **Bevásárlólista generálása**: Automatikus bevásárlólista készítése az étrendek alapján
- **Tápanyagtartalom számítás**: Receptek és étrendek tápanyagtartalmának kiszámítása

## Technológiák

- **Frontend**: Angular 17, TypeScript, SCSS
- **Backend**: Node.js, Express.js, TypeScript
- **Adatbázis**: MongoDB Atlas (felhő alapú)
- **Konténerizáció**: Docker, Docker Compose
- **Autentikáció**: JWT (JSON Web Token)

## Előfeltételek

- Docker
- Docker Compose

Nincs szükség Node.js, MongoDB vagy egyéb függőségek lokális telepítésére, minden a Docker konténerekben fut.

## Projekt Struktúra

```
PrfGyak/
├── frontend/          # Angular alkalmazás
│   ├── src/           # Angular forrásfájlok
│   └── ...            # Angular konfigurációs fájlok
├── backend/           # Node.js backend
│   ├── models/        # MongoDB modellek
│   ├── routes/        # API végpontok
│   ├── middleware/    # Middleware-ek (pl. autentikáció)
│   ├── server.js      # Express szerver
│   └── seed.js        # Adatbázis seed script
├── Dockerfile         # Docker konfiguráció
└── docker-compose.yml # Docker Compose konfiguráció
```

## Telepítés és Indítás

1. Klónozd le a repository-t:
```bash
git clone <repository-url>
cd PrfGyak
```

2. Indítsd el a Docker konténereket:

```bash
# Leállítás és tisztítás (ha már futott korábban)
sudo docker-compose down

# Konténerek indítása
sudo docker-compose up --build
```

3. Seed adatok betöltése (opcionális):

```bash
# Új terminálban
sudo docker exec -it mean-stack npm run seed
```

## Elérhetőség

- Frontend: http://localhost:4200
- Backend API: http://localhost:3000
- API dokumentáció: http://localhost:3000/api-docs (ha implementálva van)
- MongoDB: MongoDB Atlas felhő szolgáltatás

## API Végpontok

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

## MongoDB Atlas

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
- Seed adatok betöltése:
  ```bash
  sudo docker exec mean-stack npm run seed
  ```

## Tesztelés

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

## Hibaelhárítás

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
  sudo docker-compose down -v && sudo docker-compose up --build
  ```


