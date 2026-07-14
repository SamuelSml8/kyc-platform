# Guía de despliegue — KYC Platform

Entorno de producción:

- API: Cloudflare Workers
- Frontend: Cloudflare Pages
- Persistencia: D1 (metadata) + R2 (imágenes)

## Prerrequisitos

```bash
cd apps/api
npx wrangler login
```

## 1. Backend

### 1.1 Base de datos D1

```bash
cd apps/api
npx wrangler d1 create kyc-db
```

Actualizar `database_id` en `apps/api/wrangler.toml` con el valor generado:

```toml
[[d1_databases]]
binding = "DB"
database_name = "kyc-db"
database_id = "<DATABASE_ID>"
migrations_dir = "migrations"
```

### 1.2 Bucket R2

```bash
npx wrangler r2 bucket create kyc-images
```

Binding esperado en `wrangler.toml`:

```toml
[[r2_buckets]]
binding = "IMAGES"
bucket_name = "kyc-images"
```

### 1.3 Migraciones

```bash
npm run db:migrate:remote
```

### 1.4 Variables

Configurar en `wrangler.toml` o en el dashboard del Worker:

```toml
[vars]
CORS_ORIGIN = "https://<proyecto>.pages.dev"
```

Durante el primer despliegue del Worker se puede dejar temporalmente `http://localhost:5173` y ajustarlo cuando Pages esté disponible.

### 1.5 Publicar el Worker

```bash
npm run deploy
```

Verificación:

```bash
curl https://<worker-url>/health
```

## 2. Frontend (Cloudflare Pages)

### Opción A — Dashboard

1. Workers & Pages → Create → conectar el repositorio `SamuelSml8/kyc-platform`.
2. Configuración de build:
   - Framework preset: Vite
   - Root directory: `apps/web`
   - Build command: `npm run build`
   - Build output directory: `dist`
3. Variable de entorno (Production):
   - `VITE_API_URL` = URL del Worker (sin barra final)
4. Deploy.

El archivo `apps/web/public/_redirects` asegura el enrutado SPA.

### Opción B — CLI

```bash
cd apps/web
VITE_API_URL=https://<worker-url> npm run build
npx wrangler pages deploy dist --project-name=kyc-platform
```

En Windows (PowerShell):

```powershell
cd apps/web
$env:VITE_API_URL="https://<worker-url>"
npm run build
npx wrangler pages deploy dist --project-name=kyc-platform
```

## 3. CORS

1. Tomar el origin de Pages (`https://….pages.dev`).
2. Asignarlo a `CORS_ORIGIN` en el Worker.
3. Volver a desplegar:

```bash
cd apps/api
npm run deploy
```

## 4. Verificación funcional

1. Abrir la URL de Pages.
2. Enviar una verificación y confirmar estado `pending`.
3. Probar aprobación y rechazo.
4. Actualizar la tabla de URLs en el README.

## Solución de problemas

| Síntoma | Revisión |
|---------|----------|
| Error CORS en el navegador | `CORS_ORIGIN` debe coincidir exacto con el origin de Pages |
| HTTP 500 al crear | Migración remota aplicada y binding `DB` correcto |
| El front llama a localhost | Rebuild de Pages con `VITE_API_URL` de producción |
| Imagen rechazada | Máx. 1 MB; tipos JPEG/PNG/WebP |
| 404 en rutas del SPA | Confirmar `dist/_redirects` en el artefacto de build |
| Fallo al servir `/files/...` | Binding `IMAGES` y bucket R2 creados |
