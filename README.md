# NetsRow ERP

Frontend React, TypeScript, Tailwind y Vite. La base técnica incorpora una API NestJS con Prisma y PostgreSQL.

## Desarrollo local

Usa Node.js 24 y Docker Compose. Desde la raíz:

```powershell
Copy-Item .env.example .env
docker compose up -d postgres
npm ci
npm run db:generate
npm run db:migrate
npm run db:seed
npm run api:dev
```

Si ya tienes un archivo `.env`, conserva su contenido y añade la variable `DATABASE_URL` del ejemplo. La base de desarrollo se publica en `127.0.0.1:55432`. La carga inicial crea el catálogo ficticio si aún no existe.

En otra terminal, ejecuta `npm run dev` y abre `http://localhost:3000/base-tecnica` (o el puerto indicado por Vite). Esta vista de desarrollo consulta PostgreSQL por la API. Si falla la consulta, muestra un error. La portada comercial y las pantallas del ERP siguen usando los datos de la demo.

API local: `http://127.0.0.1:3001/api/health` y `http://127.0.0.1:3001/api/demo/catalog`.

Validación local: `npm run api:check`, `npm run lint` y `npm run build`. GitHub Actions ejecuta además las migraciones y comprueba el catálogo con una base PostgreSQL temporal.

## Fase 2 · Acceso de prueba por empresa

Si el puerto 3001 está ocupado, define `API_PORT=3002` en el `.env` local y
reinicia la API y Vite. Ambos leen el mismo puerto. El proxy ya no requiere
editar su destino a mano.

Después de traer los cambios, ejecuta `npm run db:generate` y
`npm run db:migrate` sobre tu base local. Para crear las dos empresas
ficticias, en PowerShell ejecuta:

```powershell
$env:NETSROW_SEED_TEST_TENANTS = "true"
npm run db:seed:tenants
Remove-Item Env:NETSROW_SEED_TEST_TENANTS
```

Con la API y Vite iniciados, abre `/acceso-tecnico`. Las cuentas ficticias
son `test-a@example.test` y `test-b@example.test`, ambas con contraseña
`NetsRow-Local-2026`. Cierra sesión entre ambas pruebas. Los productos deben
ser diferentes. Esta vista se habilita en desarrollo y el login comercial
sigue funcionando en modo demo. El siguiente tramo cubre altas e invitaciones,
sucursales, roles, Superadmin y habilitación de módulos.
