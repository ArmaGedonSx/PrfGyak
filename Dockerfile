# Use Node.js 20 as base image
FROM node:20

# Set working directory
WORKDIR /app

# Install Angular CLI globally
RUN npm install -g @angular/cli

# Backend setup
COPY backend/package.json /app/backend/
WORKDIR /app/backend
RUN npm install
COPY backend/ /app/backend/

# Frontend setup
COPY frontend/package.json /app/frontend/
WORKDIR /app/frontend
RUN npm install
COPY frontend/ /app/frontend/

# Set permissions for node_modules
# RUN chmod -R 777 /app/backend/node_modules /app/frontend/node_modules

# Expose ports
EXPOSE 4200 3000

# Start both servers
CMD ["sh", "-c", "cd /app/backend && node server.js & cd /app/frontend && ng serve --host 0.0.0.0 --poll=2000"]
