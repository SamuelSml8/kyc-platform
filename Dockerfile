# Build local del frontend para previsualizar con Nginx.
# El deploy de producción es Cloudflare Pages + Workers (ver README).

FROM node:22-alpine AS build
WORKDIR /app

COPY apps/web/package.json apps/web/package-lock.json ./
RUN npm ci

COPY apps/web/ ./

ARG VITE_API_URL=http://localhost:8787
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

FROM nginx:1.27-alpine AS runtime
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
