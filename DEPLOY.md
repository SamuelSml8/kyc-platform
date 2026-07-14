# Deploy checklist — KYC Platform

Producción: **Cloudflare Workers** (API) + **Cloudflare Pages** (web) + **D1** + **R2**.

No inventar URLs: pega las reales en el [README](./README.md) cuando el deploy esté vivo.

---

## 0. Prerrequisitos

```bash
npx wrangler login
```

Cuenta Cloudflare lista (Free plan alcanza para esta demo).

---

## 1. Backend (Workers + D1 + R2)

Desde `apps/api`:

### 1.1 Crear la base D1

```bash
cd apps/api
npx wrangler d1 create kyc-db
```

Copia el `database_id` que imprime el comando y reemplaza el placeholder en [`wrangler.toml`](./apps/api/wrangler.toml):

```toml
[[d1_databases]]
binding = "DB"
database_name = "kyc-db"
database_id = "<TU_DATABASE_ID>"
migrations_dir = "migrations"
```

### 1.2 Crear bucket R2

```bash
npx wrangler r2 bucket create kyc-images
```

En `wrangler.toml` ya está el binding:

```toml
[[r2_buckets]]
binding = "IMAGES"
bucket_name = "kyc-images"
```

### 1.3 Migraciones remotas

```bash
npm run db:migrate:remote
```

### 1.4 Variables de producción

En `wrangler.toml` o en el dashboard del Worker:

```toml
[vars]
CORS_ORIGIN = "https://TU-PROYECTO.pages.dev"
```

Si usas dominio custom, añade también ese origin (separados por coma):

```toml
CORS_ORIGIN = "https://TU-PROYECTO.pages.dev,https://tu-dominio.com"
```

> Tip: puedes desplegar el Worker primero con `http://localhost:5173`, subir Pages, y luego actualizar `CORS_ORIGIN` + redeploy.

### 1.5 Deploy API

```bash
npm run deploy
```

Anota la URL (`https://kyc-platform-api.<subdomain>.workers.dev` o similar).

Smoke test:

```bash
curl https://TU-WORKER/health
```

---

## 2. Frontend (Pages)

### Opción A — Dashboard Cloudflare Pages

1. Workers & Pages → Create → Connect to Git → `SamuelSml8/kyc-platform`
2. Build settings:
   - **Framework preset:** Vite
   - **Root directory:** `apps/web`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
3. Environment variables (Production):
   - `VITE_API_URL` = `https://TU-WORKER-URL` (sin slash final)
4. Deploy

SPA: el archivo `apps/web/public/_redirects` envía rutas al `index.html`.

### Opción B — CLI

```bash
cd apps/web
# Asegura VITE_API_URL en el entorno de build
npx wrangler pages deploy dist --project-name=kyc-platform
```

(Build previo: `VITE_API_URL=https://TU-WORKER npm run build`)

---

## 3. Cerrar el circuito CORS

1. Copia el origin de Pages (`https://….pages.dev`)
2. Ponlo en `CORS_ORIGIN` del Worker
3. `cd apps/api && npm run deploy` de nuevo

---

## 4. Evidencia para la entrega

1. Abre la URL de Pages → completa el formulario → llega a detalle `pending`
2. Aprobar / rechazar y recargar
3. Screenshots + URLs públicas en el README
4. Screenshots de Antigravity 2.0 **locales** (no en el repo)

---

## 5. Troubleshooting

| Problema | Qué revisar |
|----------|-------------|
| CORS en browser | `CORS_ORIGIN` exacto (https, sin path) |
| 500 al crear | Migración D1 remota aplicada; binding `DB` |
| Front llama a localhost | Rebuild Pages con `VITE_API_URL` correcta (Vite embebe en build) |
| Imagen rechazada | Tamaño ≤ 1 MB; JPEG/PNG/WebP |
| Ruta `/verification/:id` 404 en Pages | `_redirects` presente en el build (`dist/_redirects`) |
