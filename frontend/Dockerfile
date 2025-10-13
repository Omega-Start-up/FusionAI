# Stage 1: Build
FROM node:18-alpine AS build

WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm ci

# Copier le code source
COPY . .

# Build de l'application
RUN npm run build:prod

# Stage 2: Serve
FROM nginx:alpine

# Copier la configuration nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copier les fichiers buildés
COPY --from=build /app/dist/edu-chain-frontend /usr/share/nginx/html

# Exposer le port
EXPOSE 4200

# Commande de démarrage
CMD ["nginx", "-g", "daemon off;"]