# Use Node.js 20 as base image
FROM node:20

# Set working directory
WORKDIR /app

# Backend setup
COPY backend/package.json /app/
RUN npm install
COPY backend/ /app/

# Expose backend port
EXPOSE 3000

# Start backend server
CMD ["node", "server.js"]
