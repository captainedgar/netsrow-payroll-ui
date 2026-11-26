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

## Fase 2 · Recepción comercial en pruebas

El configurador conserva los importes ilustrativos. Al habilitar la recepción, el formulario avisa que los importes finales quedan por cotizar. PostgreSQL conserva la selección, el contacto, la versión y la fecha. El servidor valida los identificadores contra el catálogo y recibe únicamente la solicitud. La confirmación muestra una referencia `COT-…` y no incluye importes.

Aplica `npm run db:generate` y `npm run db:migrate`. Para probar con datos ficticios, agrega a `.env` y reinicia Vite y la API:

```dotenv
NETSROW_COMMERCIAL_INTAKE=true
VITE_NETSROW_COMMERCIAL_INTAKE=true
```

Completa el configurador de planes y envía una solicitud. Consulta `CommercialQuoteRequest` desde Prisma Studio (`npx prisma studio`) en tu máquina y con una base de pruebas. No hay un listado público ni se envían avisos. Con las variables omitidas o en `false`, el configurador sigue en modo demo.

Para publicar, aprueba en DOP y con vigencia la tarifa de cada plan y módulo, la unidad de cobro, los cupos y excedentes de e-CF, el precio total y las condiciones del equipo, la instalación, la capacitación y los impuestos. Faltan el catálogo público con esas tarifas y la bandeja comercial con acceso restringido. Antes de habilitar recepción pública, define el aviso de privacidad, la retención, los controles antiabuso y el manejo de reintentos.

## Fase 3 · Piloto de acceso multiempresa

El acceso principal `/login` usa la cookie de la API y `/erp` presenta el
catálogo real de la empresa. Al cerrar sesión se invalida la cookie en el
servidor. Para usar el portal local, ejecuta la API y Vite desde la misma
carpeta. Las áreas de plataforma y registro siguen en demostración.

En una base local de pruebas puedes cargar las dos cuentas ficticias con
`db:seed:tenants` como se indica arriba. Abre `/login`, entra con cada cuenta
y comprueba que los productos pertenecen a su empresa. Antes de habilitar el acceso público
quedan pendientes altas, recuperación, roles, módulos, controles de abuso y
el acceso de Superadmin.

## Fase 4 · Alta de productos en el piloto

En una base local de pruebas, detén la API, ejecuta `npm run db:generate` y
`npm run db:migrate` y vuelve a ejecutar `db:seed:tenants` con el indicador
de prueba indicado arriba. El seed autoriza el alta para `test-a@example.test`.
La cuenta `test-b@example.test` conserva el acceso de solo lectura.

Inicia sesión como Comercio A, registra
un producto y recarga. Al iniciar sesión como Comercio B, el producto de la
otra empresa y el formulario de alta quedan fuera de la vista. La API verifica
el permiso y toma la empresa desde la sesión. Este incremento registra nombre
e identificador. SKU, precio, existencias, edición y flujos de venta quedan
pendientes.
