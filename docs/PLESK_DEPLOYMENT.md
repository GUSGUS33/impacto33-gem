# Despliegue seguro en Plesk y PM2

Esta guía actualiza la instalación existente de `impacto33.com`. No sustituye ni borra
la versión activa hasta haber creado una copia recuperable.

## Arquitectura

- Nginx/Apache de Plesk recibe HTTPS y envía las peticiones a Next.js en `127.0.0.1:3000`.
- Next.js sirve la web y reenvía tRPC, OAuth y feeds a Express en `127.0.0.1:3101`.
- PM2 mantiene los procesos `impacto33` e `impacto33-api`.
- El puerto `3001` pertenece a otro servicio del VPS y no debe reutilizarse.
- `GET /api/health` comprueba ambos procesos y responde `200` únicamente si los dos están disponibles.

## Requisitos previos

1. Node.js 20.9 o posterior, npm y PM2 disponibles para el usuario del dominio.
2. Plesk Git apuntando al repositorio `GUSGUS33/impacto33-gem`, rama `main`.
3. Modo de despliegue **manual** durante la primera actualización.
4. Archivo `.env` real conservado fuera de Git y con permisos restrictivos.
5. Copia de seguridad del directorio activo y de la base de datos.

No se deben ejecutar migraciones de base de datos automáticamente. Deben revisarse y
respaldarse por separado antes de usar `drizzle-kit migrate`.

## Variables que deben revisarse

Nunca se copian valores secretos al repositorio ni a una incidencia de GitHub.

- `APP_URL=https://impacto33.com`
- `NEXT_PUBLIC_WP_GRAPHQL_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DATABASE_URL`
- `JWT_SECRET`
- `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- `STRIPE_ENABLED`, `NEXT_PUBLIC_STRIPE_ENABLED`
- `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`, `STRIPE_SECRET_KEY`
- Variables OAuth/Forge si esas integraciones siguen activas.

Las antiguas variables `VITE_*` continúan aceptándose durante la transición, pero las
variables `NEXT_PUBLIC_*` son las canónicas.

## Primera actualización controlada

Ejecutar desde el directorio real de la aplicación con el usuario del dominio:

```bash
node -v
npm -v
pm2 ls
git status --short
git branch --show-current
git log -1 --oneline
```

Guardar el commit actualmente operativo y crear una copia fuera del directorio activo.
El nombre y la ruta exactos de la copia se deciden en el servidor antes de continuar.

Después, actualizar exclusivamente desde `main`:

```bash
git fetch origin main
git pull --ff-only origin main
npm ci --no-audit --no-fund
npm audit
npm run check
npm test
npm run deploy:build
pm2 startOrReload ecosystem.config.cjs --env production --update-env
pm2 save
```

## Comprobación posterior

```bash
pm2 status
pm2 logs --lines 100
curl --fail --silent --show-error https://impacto33.com/api/health
curl --fail --silent --show-error --output /dev/null https://impacto33.com/
curl --fail --silent --show-error --output /dev/null https://impacto33.com/auth/login
```

También se comprueban manualmente catálogo, búsqueda, presupuesto, registro/login,
correo, carrito y cualquier flujo de pago habilitado.

## Reversión

Si falla una comprobación, no se modifica la base de datos. Se recupera la copia del
directorio o el commit operativo registrado antes del despliegue, se reinstalan sus
dependencias, se reconstruye y se recarga PM2 con su configuración anterior.

La primera actualización no debe configurarse como despliegue automático de Plesk.
Solo después de una puesta en producción verificada se valorará automatizar pasos que
no incluyan migraciones ni gestión de secretos.
