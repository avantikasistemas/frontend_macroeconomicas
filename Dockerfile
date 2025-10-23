# Dockerfile con arquitectura específica
FROM node:20-alpine as build-stage

WORKDIR /app

# Instalar git para poder clonar el repo
RUN apk add --no-cache git

# Forzar descarga fresca desde GitHub sin usar caché de Docker
ARG CACHEBUST=1
RUN echo "Cache bust: $CACHEBUST"

# Clonar repositorio directamente
RUN git clone --depth 1 --branch master https://github.com/avantikasistemas/frontend_macroeconomicas.git /tmp/repo && \
    cp -r /tmp/repo/* /app/ && \
    cp -r /tmp/repo/.* /app/ 2>/dev/null || true && \
    rm -rf /tmp/repo

# Instalar dependencias
RUN npm ci

ARG VITE_API_URL=http://130.1.1.7:8002
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

FROM nginx:stable-alpine as production-stage

COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
