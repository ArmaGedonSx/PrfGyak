# --- 1. Lépés: Frontend Buildelése ---
# Node.js alap, build néven hivatkozunk rá
FROM node:20-alpine as frontend-builder

WORKDIR /app/frontend

# Először csak a package.json-t másoljuk a gyorsabb cache miatt
COPY frontend/package*.json ./
RUN npm install

# Most másoljuk a forráskódot
COPY frontend/ .

# Környezeti változó beállítása build-time-ban
# Ez felülírja az environment.ts-t production build során
RUN echo 'export const environment = { production: true, apiUrl: "" };' > src/environments/environment.ts

# Angular Buildelése Production módba
# FONTOS: Ez létrehozza a dist mappát
RUN npm run build


# --- 2. Lépés: Backend és Végső Konténer ---
FROM node:20-alpine

WORKDIR /app

# Backend függőségek telepítése (bcryptjs nem igényel Python-t)
COPY backend/package*.json ./
RUN npm ci --only=production

# Backend kód másolása
COPY backend/ .

# --- A VARÁZSLAT ITT TÖRTÉNIK ---
# Átmásoljuk az 1. lépésben (frontend-builder) elkészült Angular fájlokat
# a Backend "public" mappájába.
# FONTOS: Ellenőrizd, hogy a te projektedben dist/frontend/browser vagy simán dist/frontend van-e!
# Angular 17+ esetén általában: dist/<project-name>/browser
COPY --from=frontend-builder /app/frontend/dist/*/browser ./public

# Környezeti változók alapértékei
ENV PORT=3000
EXPOSE 3000

# Szerver indítása
CMD ["node", "server.js"]
