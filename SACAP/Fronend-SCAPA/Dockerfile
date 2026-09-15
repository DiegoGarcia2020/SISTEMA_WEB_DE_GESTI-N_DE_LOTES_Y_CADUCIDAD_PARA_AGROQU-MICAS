# ── Etapa de build: compila el Angular con Node ─────────────
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration production

# ── Etapa de runtime: sirve los estaticos con nginx ─────────
FROM nginx:alpine
COPY --from=build /app/dist/frontend-scapa/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
