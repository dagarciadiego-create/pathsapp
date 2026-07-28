# PATHSapp

Aplicación web para gestionar y visualizar la **labor de advocacy y lobby** de una
entidad de pacientes con hemofilia: qué se quiere conseguir, quién es responsable,
a quién hay que contactar, qué acciones concretas hay que hacer y cómo va el
progreso hacia los objetivos.

Disponible en **español e inglés**, con diseño responsive pensado para poder
añadirse a la pantalla de inicio del móvil y usarse como una app.

---

## 1. Funcionalidades

### Labores de advocacy y lobby (página principal)
- Alta, edición y eliminación de labores.
- Cada labor tiene: nombre, **tipo** (de *hacer cosas* / acción, o de *conseguir
  cosas* / logro), **responsable**, **fecha objetivo** y **estado** (sin
  empezar, en curso, conseguido, estancado, cancelado).
- Filtros por tipo/estado y buscador por nombre, responsable o categoría.
- Panel resumen: labores totales, conseguidas, en curso y con plazo vencido.

### Detalle de cada labor
- **A quién contactar**: contactos vinculados a la labor (ver Directorio más
  abajo), indicando si la persona/organización es **de quien depende
  conseguirlo** (decisor) o **quien puede ayudar a conseguirlo** (aliado), con
  notas específicas para esa labor.
- **Acciones y tareas**: las "pequeñas tareas" de cada labor — cartas,
  llamadas telefónicas, reuniones, encuentros o campañas — cada una marcada
  como **planificada o no planificada** (para diferenciar lo programado de lo
  reactivo/oportunista), con fecha, estado, responsable y **documentos
  adjuntos** (la carta enviada, el acta de la reunión, una foto...). Incluye
  filtro rápido Todas / Planificadas / No planificadas.
- **Indicadores de esta labor**: KPIs ligados a esa labor concreta.

### Directorio de contactos
- Directorio **compartido**: la misma persona u organización (p. ej. una
  dirección general de un ministerio) puede estar vinculada a varias labores
  a la vez, sin duplicar sus datos.
- Alta, edición y eliminación de contactos; desde cada labor se puede
  **vincular un contacto ya existente** del directorio o **crear uno nuevo**
  sobre la marcha, indicando el tipo de relación para esa labor concreta.
- Cada contacto muestra a qué labores está vinculado.

### Calendario
- Vista de mes con las fechas objetivo de las labores y las fechas previstas
  de las acciones.
- Listas siempre visibles de **próximos 30 días** y **vencidos**, y agenda
  del día seleccionado.

### Indicadores de éxito
- Tabla global de indicadores (ligados a una labor o generales de la
  organización): valor objetivo, valor actual y % completado con barra de
  progreso.
- Resumen con el progreso global de todas las labores.

### Informes
- Descarga de un informe con el estado de todas las labores e indicadores,
  en **PDF** (para repartir en una reunión) y **Excel** (para trabajar los
  datos), útil para reuniones de junta o la memoria anual.

### Página pública de transparencia
- Vista de solo lectura en `/public`, **sin datos de contacto ni controles de
  edición**, con los logros conseguidos, las labores en marcha y los
  indicadores de impacto. Tiene su propia cabecera, distinta del panel
  interno, pensada para compartir con socios, prensa o el público en general.

### Bilingüe y "como una app"
- Selector de idioma ES/EN persistente en la URL (`/es/...`, `/en/...`).
- Manifest + iconos PWA: en el móvil se puede "Añadir a pantalla de inicio"
  y se abre a pantalla completa, como una app nativa. El menú de navegación
  se adapta a un menú desplegable en pantallas pequeñas.

---

## 2. Stack técnico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) + TypeScript |
| Estilos | Tailwind CSS 4 |
| Base de datos | SQLite (desarrollo) vía Prisma ORM 7 + `@prisma/adapter-better-sqlite3` |
| Internacionalización | next-intl (rutas `/es`, `/en`) |
| Validación | Zod |
| Informes | `exceljs` (Excel) y `@react-pdf/renderer` (PDF) |
| Adjuntos | almacenamiento en disco local (`uploads/`), servidos vía API |
| Iconos | lucide-react + iconos PWA generados con `next/og` |

**¿Por qué una API REST separada del front?** Todas las operaciones (crear,
editar, borrar labores, contactos, acciones, indicadores, adjuntos) pasan por
endpoints REST bajo `/api/...` (ver más abajo). Esto significa que, si en el
futuro se quiere construir una app móvil nativa (iOS/Android) o una app de
escritorio, **puede reutilizar esta misma API** sin duplicar lógica de
negocio — la web es un cliente más de esa API.

**¿Por qué dos zonas de navegación distintas?** Las páginas internas (labores,
directorio, calendario, indicadores, informes) viven bajo el grupo de rutas
`(app)` y comparten la cabecera con el menú de administración. La página
`/public` vive en un grupo de rutas separado con su propia cabecera mínima,
así nunca hereda por accidente los controles de edición ni los datos de
contacto internos.

---

## 3. Cómo ejecutar el proyecto en local

```bash
npm install
cp .env.example .env        # ya viene configurado para SQLite local
npx prisma migrate dev      # crea dev.db con el esquema
npx prisma db seed          # datos de ejemplo (opcional pero recomendado)
npm run dev                 # http://localhost:3000
```

Otros comandos útiles:

```bash
npm run build       # build de producción
npm run lint         # ESLint
npm run db:studio   # explorador visual de la base de datos (Prisma Studio)
npm run db:seed     # volver a cargar los datos de ejemplo
```

### Pasar a una base de datos "de verdad"

SQLite es cómodo para desarrollo/demo, pero un fichero local no sobrevive en
plataformas serverless (Vercel, etc.) porque el disco no es persistente entre
peticiones. Para producción, cambia el `provider` en `prisma/schema.prisma` a
`postgresql` (o `mysql`), pon la cadena de conexión real en `DATABASE_URL` y
cambia el adapter en `src/lib/prisma.ts` por `@prisma/adapter-pg` (Prisma ya
trae ese flujo documentado). El resto de la aplicación no cambia.

Lo mismo aplica a los **documentos adjuntos**: hoy se guardan en la carpeta
local `uploads/` (fuera de `public/`, gitignored). En un despliegue
serverless ese disco tampoco es persistente — para producción, cambia
`src/lib/storage.ts` para subir a un bucket (S3, Cloudflare R2, etc.) en vez
de al disco local; el resto de la aplicación (subida, descarga, borrado) no
cambia porque toda la lógica de almacenamiento está aislada en ese fichero.

---

## 4. Modelo de datos

```
AdvocacyGoal (labor)
 ├─ goalContacts[]  → vínculo a un Contact del directorio, con su relación
 │                     para esta labor (DECISION_MAKER | SUPPORTER) y notas
 ├─ subtasks[]      → acciones: LETTER | CALL | MEETING | ENCOUNTER | CAMPAIGN | OTHER
 │    └─ attachments[]  documentos adjuntos a esa acción
 └─ indicators[]    → KPIs ligados a esta labor

Contact (directorio compartido, independiente de las labores)
 └─ goalLinks[]     → labores a las que está vinculado (vía GoalContact)

Indicator (también puede existir sin `goal` → indicador general de la entidad)
```

Esquema completo en [`prisma/schema.prisma`](./prisma/schema.prisma).

## 5. API REST

| Recurso | Endpoints |
|---|---|
| Labores | `GET/POST /api/goals`, `GET/PATCH/DELETE /api/goals/:id` |
| Directorio de contactos | `GET/POST /api/contacts`, `GET/PATCH/DELETE /api/contacts/:id` |
| Vínculo contacto↔labor | `POST /api/goals/:id/contacts`, `PATCH/DELETE /api/goal-contacts/:id` |
| Acciones | `POST /api/goals/:id/subtasks`, `PATCH/DELETE /api/subtasks/:id` |
| Adjuntos | `POST /api/subtasks/:id/attachments`, `GET /api/attachments/:id/file`, `DELETE /api/attachments/:id` |
| Indicadores | `GET/POST /api/indicators`, `PATCH/DELETE /api/indicators/:id` |
| Informes | `GET /api/reports/pdf?locale=es`, `GET /api/reports/excel?locale=es` |

Todos los cuerpos de petición JSON se validan con Zod (`src/lib/validation.ts`).

---

## 6. Ideas para seguir mejorando

Cosas típicas en este tipo de herramienta de incidencia política que **no**
están implementadas todavía, por si interesa añadirlas más adelante:

- **Usuarios y roles** (admin / editor / solo lectura), con inicio de sesión
  — ahora mismo cualquiera que acceda a la web puede editar todo, y `/public`
  es de solo lectura únicamente porque su interfaz no tiene botones de
  edición, no porque haya control de acceso real.
- **Recordatorios/notificaciones** de plazos próximos o vencidos (por email
  o push), a partir de los datos que ya calcula el Calendario.
- **Historial de cambios** (quién modificó qué y cuándo) para rendir cuentas
  ante la junta directiva.
- **Filtros y exportación parcial** en Informes (por ejemplo, un informe solo
  de las labores de una categoría o de un rango de fechas).
- **Almacenamiento de adjuntos en la nube** en vez de disco local, necesario
  antes de desplegar en un entorno serverless (ver sección 3).

## 7. English summary

PATHSapp tracks a hemophilia patient organization's advocacy and lobbying
work: goals (either *action*-type or *outcome*-type), who owns each one, a
shared contact directory (the same stakeholder can be linked to several
goals, each with its own decision-maker/supporter relationship), the
concrete actions under each goal (letters, calls, meetings, encounters,
campaigns — planned or unplanned, with file attachments), a calendar of
upcoming/overdue dates, success indicators with target/current values, a
downloadable PDF/Excel report, and a public read-only transparency page
(`/public`) with its own separate header and no contact data or edit
controls. It's bilingual (ES/EN) and installable as a PWA on mobile, with a
collapsible nav menu on small screens. All mutations go through a REST API
(`/api/...`) so a future native mobile app could reuse the same backend. See
the sections above for setup, data model, and suggested next features.
