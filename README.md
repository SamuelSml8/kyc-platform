# KYC Platform

Mini plataforma de validación de identidad (KYC) para assessment técnico.

**Stack:** React + Vite + TailwindCSS (Cloudflare Pages) · Hono.js (Cloudflare Workers) · D1 · TypeScript.

**Repositorio:** https://github.com/SamuelSml8/kyc-platform

---

## URLs públicas (deploy)

> Sustituye estos placeholders después de desplegar.

| Servicio | URL |
|----------|-----|
| Frontend (Pages) | `` |
| API (Workers) | `` |

---

## Antigravity 2.0

El brief pide iniciar el desarrollo con **Antigravity 2.0** (plataforma agent-first de Google) como herramienta de apoyo para generar y organizar código.

- Se usó Antigravity para el arranque / organización del trabajo.
- El refinamiento, arquitectura y calidad del código se cerraron en Cursor sobre este monorepo.
- La evidencia (screenshots de la sesión) se guarda **fuera del repositorio** (no se suben chats ni secretos).

---

## Arquitectura

```
kyc-platform/
  apps/
    api/   # Hono + Workers + D1
    web/   # React + Vite + Tailwind
  Dockerfile
  docker-compose.yml
  README.md
```

Flujo:

1. El usuario envía datos + selfie + documento (`POST /verification`) → estado `pending`.
2. Consulta el resultado (`GET /verification/:id`).
3. Demo de revisión: `PATCH /verification/:id` con `{ "status": "approved" | "rejected" }` (sin auth; solo para la prueba — en producción llevaría control de acceso).

Persistencia: **Cloudflare D1**.

---

## Requisitos locales

- Node.js 20+
- Cuenta [Cloudflare](https://dash.cloudflare.com/)
- Wrangler CLI (viene como dep de `apps/api`)

---

## Setup local

### 1. API

```bash
cd apps/api
npm install
# Si venías del schema viejo (base64), borra la D1 local y migra de nuevo:
# Remove-Item -Recurse -Force .wrangler
npm run db:migrate:local
npm run dev
```

API en `http://localhost:8787`  
Health: `GET /health`  
Imágenes: R2 local vía Wrangler (binding `IMAGES`)

### 2. Frontend

```bash
cd apps/web
cp .env.example .env
# VITE_API_URL=http://localhost:8787
npm install
npm run dev
```

Web en `http://localhost:5173`

### Tests API

```bash
cd apps/api
npm test
```

---

## Contrato API

Todas las respuestas JSON usan el mismo envelope (mensajes en inglés):

```json
{ "ok": true, "message": "...", "data": { } }
```

```json
{ "ok": false, "message": "...", "data": null }
```

### `POST /verification` (multipart/form-data)

Campos:

- `name`, `email`, `documentNumber` (texto)
- `selfie`, `documentImage` (archivos imagen)

La API sube las imágenes a **Cloudflare R2**, guarda solo las **keys** en D1 y responde URLs públicas del Worker (`/files/...`).

Respuesta `201`: `data.selfie` y `data.documentImage` son URLs, no base64.

### `GET /verification/:id`

`200` o `404` (`Verification not found.`).

### `GET /files/*`

Sirve el binario desde R2 (para el preview en el front).

### `PATCH /verification/:id` (demo de revisión)

```json
{ "status": "approved" }
```

o `"rejected"`.

### Validaciones / seguridad básica

- Campos requeridos + email válido
- Imágenes JPEG/PNG/WebP · máx. ~1 MB
- D1 guarda keys; R2 guarda archivos
- CORS restringido por `CORS_ORIGIN`
- Envelope consistente éxito/error
- Sin secretos en el repo

---

## Deploy real (Cloudflare)

Guía detallada: [DEPLOY.md](./DEPLOY.md)

Resumen:

1. Crear D1 + aplicar migraciones remotas + `wrangler deploy` en `apps/api`
2. Configurar `CORS_ORIGIN` con el origin de Pages
3. Desplegar `apps/web` en Cloudflare Pages (`VITE_API_URL` = URL del Worker)
4. Pegar ambas URLs arriba en este README

---

## Docker (bonus / local)

Producción sigue siendo **Pages + Workers**. Docker sirve para previsualizar el front de forma reproducible:

```bash
# Con la API local en :8787
docker compose up --build
# → http://localhost:8080
```

---

## Bonus cubiertos

| Bonus | Estado |
|-------|--------|
| TypeScript | Sí (api + web) |
| D1 Database | Sí |
| Drag & drop upload | Sí |
| Dark mode | Sí |
| Dockerfile | Sí (+ compose) |
| Tests | Sí (`apps/api`) |

---

## Commits

Los commits se hacen de forma atómica y con mensajes claros cuando el autor lo indique (no se auto-commitea en el flujo de desarrollo).
