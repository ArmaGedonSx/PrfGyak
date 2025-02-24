# Use Node.js 20 as base image
FROM node:20

# Set working directory
WORKDIR /app

# Install Angular CLI globally
RUN npm install -g @angular/cli

# Copy frontend files and install dependencies
COPY frontend/ /app/frontend/
WORKDIR /app/frontend
RUN npm install

# Copy backend package.json and install dependencies
WORKDIR /app
COPY backend/package.json ./backend/
WORKDIR /app/backend
RUN npm install

# Copy backend files
COPY backend/ ./backend/

# Set working directory back to root
WORKDIR /app

# Expose ports
EXPOSE 4200 3000

# Start both servers
CMD ["sh", "-c", "cd /app/backend && node server.js & cd /app/frontend && ng serve --host 0.0.0.0 --poll=2000"]
