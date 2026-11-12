# =========================
# Stage 1: Build React
# =========================
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

# Vite menanam nilai env ke bundle saat build, bukan saat runtime.
# "/api" adalah jalur relatif: browser memanggil host yang sama, lalu nginx
# memproxy ke backend. Dengan begitu cookie sesi tetap first-party.
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build


# =========================
# Stage 2: Production
# =========================
FROM docker.io/library/nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]