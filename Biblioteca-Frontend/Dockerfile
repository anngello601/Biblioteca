# ETAPA 1: Compilación con Node.js
FROM node:22-alpine AS build
WORKDIR /app

# 1. Copiamos solo los archivos de dependencias
COPY package.json package-lock.json ./

# 2. Instalamos dependencias (npm ci es más rápido y seguro para CI/CD)
RUN npm ci

# 3. Copiamos el resto del código y compilamos para producción
COPY . .
RUN npm run build -- --configuration production

# ETAPA 2: Servidor web final (Nginx)
FROM nginx:alpine
# Copiamos nuestra configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiamos los archivos compilados de Angular desde la etapa anterior
# NOTA: Asegúrate de cambiar "tu-proyecto-angular" por el nombre real de tu carpeta en dist/
COPY --from=build /app/dist/Biblioteca-Frontend/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]