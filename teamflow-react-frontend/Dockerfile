FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

# Build du frontend
RUN npm run build

# Installation de serve pour servir le build Vite
RUN npm install -g serve

# Serve le build sur le port 80
CMD ["serve", "-s", "dist", "-l", "80"]

EXPOSE 80

