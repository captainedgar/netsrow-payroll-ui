# NetsRow ERP

Frontend React, TypeScript, Tailwind y Vite. La base técnica incorpora una API NestJS con Prisma y PostgreSQL.

## Desarrollo local

Usa Node.js 24 y Docker Compose. Desde la raíz:

```powershell
if (!(Test-Path .env)) { Copy-Item .env.example .env }
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

Validación local: `npm run api:check`, `npm run lint` y `npm run build`. GitHub Actions instala desde el lockfile, aplica las migraciones sobre PostgreSQL temporal y verifica el acceso al catálogo a través del proxy de Vite. También comprueba que el catálogo de empresa rechaza peticiones sin sesión.

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

## Integración de cambios de AI Studio

Usa la rama de integración para trabajar con la UI y la API juntas. Antes de incorporar otro cambio de AI Studio, ejecuta `git fetch origin` y revisa `git log --oneline HEAD..origin/main` y `git diff HEAD...origin/main`. Integra en una rama de revisión desde la base consolidada. Comprueba especialmente `package.json`, el lockfile, `vite.config.ts` y `src/App.tsx` porque contienen el arranque, el proxy y las rutas técnicas.

## Alcance de esta base

| Área | Estado |
| --- | --- |
| PostgreSQL y API | Salud, catálogo de demostración y acceso técnico por empresa |
| Portada y precios | Interfaz de AI Studio con catálogo ilustrativo |
| ERP y Superadmin | Pantallas de demostración |
| `/base-tecnica` y `/acceso-tecnico` | Vistas disponibles en desarrollo |
| `npm run db:seed` y `npm run db:seed:tenants` | Datos ficticios para bases locales o de pruebas |

El build web todavía incluye pantallas comerciales y operativas de demostración. Antes de publicar, vincula la oferta al catálogo aprobado, conecta el acceso definitivo y revisa qué rutas, cuentas y datos de demostración quedan excluidos del despliegue. Conserva las credenciales de Compose exclusivamente para desarrollo local.
