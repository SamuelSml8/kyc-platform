# KYC Platform

Mini plataforma de validación de identidad (KYC).

**Autor:** Samuel Vera Miranda  
**Repositorio:** https://github.com/SamuelSml8/kyc-platform

## Stack

| Capa | Tecnología | Deploy |
|------|------------|--------|
| Frontend | React + Vite + TailwindCSS + TypeScript | Cloudflare Pages |
| Backend | Hono.js + TypeScript | Cloudflare Workers |
| Datos | Cloudflare D1 + R2 | — |

## URLs de producción

| Servicio | URL |
|----------|-----|
| Frontend | https://kyc-platform.pages.dev |
| API | https://kyc-platform-api.veramirandasamuel6.workers.dev |

## Herramientas de desarrollo

El desarrollo se inició con **Antigravity 2.0** como apoyo para generar y organizar el código. La evidencia de esa sesión (capturas) se conserva de forma local y no se incluye en el repositorio.

## Arquitectura

```
kyc-platform/
  apps/
    api/   # Hono + Workers + D1 + R2
    web/   # React + Vite + Tailwind
  Dockerfile
  docker-compose.yml
  README.md
  DEPLOY.md
```

Flujo de negocio:

1. El usuario envía datos, selfie y documento (`POST /verification`). El caso queda en `pending`.
2. Se consulta el resultado con `GET /verification/:id`.
3. En esta demo, la revisión se simula con `PATCH /verification/:id` (`approved` | `rejected`). En un entorno productivo ese endpoint debería exigir autenticación y autorización.

La metadata vive en **D1**. Las imágenes se almacenan en **R2** y se exponen mediante URLs del Worker (`/files/...`).

## Requisitos

- Node.js 20+
- Cuenta de [Cloudflare](https://dash.cloudflare.com/)
- Wrangler (incluido en las dependencias de `apps/api`)

## Desarrollo local

### API

```bash
cd apps/api
npm install
npm run db:migrate:local
npm run dev
```

- Base: `http://localhost:8787`
- Health: `GET /health`

### Frontend

```bash
cd apps/web
cp .env.example .env
npm install
npm run dev
```

- App: `http://localhost:5173`
- Variable requerida: `VITE_API_URL=http://localhost:8787`

### Tests

```bash
cd apps/api
npm test
```

## Contrato de la API

Respuestas JSON con envelope uniforme (mensajes en inglés):

```json
{ "ok": true, "message": "...", "data": { } }
```

```json
{ "ok": false, "message": "...", "data": null }
```

### `POST /verification` — `multipart/form-data`

| Campo | Tipo |
|-------|------|
| `name` | texto |
| `email` | texto |
| `documentNumber` | texto |
| `selfie` | archivo (JPEG / PNG / WebP) |
| `documentImage` | archivo (JPEG / PNG / WebP) |

`201`: el objeto en `data` incluye `status: "pending"` y URLs de imagen.

### `GET /verification/:id`

`200` o `404`.

### `GET /files/*`

Sirve el contenido almacenado en R2.

### `PATCH /verification/:id`

```json
{ "status": "approved" }
```

También acepta `"rejected"`.

### Validación y seguridad básica

- Campos obligatorios y formato de email
- Imágenes JPEG/PNG/WebP, máximo ~1 MB
- CORS limitado por `CORS_ORIGIN`
- Sin secretos versionados en el repositorio

## Despliegue

Pasos detallados en [DEPLOY.md](./DEPLOY.md).

Resumen:

1. Provisionar D1 y R2, aplicar migraciones y desplegar el Worker.
2. Desplegar el frontend en Cloudflare Pages con `VITE_API_URL` apuntando al Worker.
3. Actualizar `CORS_ORIGIN` del Worker con el origin de Pages.
4. Documentar las URLs públicas en este README.

## Docker

Pensado para preview local del frontend. La producción se sirve con Pages + Workers.

```bash
docker compose up --build
```

Disponible en `http://localhost:8080` (la API debe estar corriendo en `:8787`).

## Bonus implementados

| Ítem | Estado |
|------|--------|
| TypeScript | Sí |
| D1 | Sí |
| R2 (imágenes por URL) | Sí |
| Drag & drop | Sí |
| Dark mode | Sí |
| Dockerfile | Sí |
| Tests de API | Sí |
