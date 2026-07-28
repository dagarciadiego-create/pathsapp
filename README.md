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
- **A quién contactar**: directorio de contactos por labor, indicando si la
  persona/organización es **de quien depende conseguirlo** (decisor) o
  **quien puede ayudar a conseguirlo** (aliado), con organización, cargo,
  email, teléfono y notas.
- **Acciones y tareas**: las "pequeñas tareas" de cada labor — cartas,
  llamadas telefónicas, reuniones, encuentros o campañas — cada una marcada
  como **planificada o no planificada** (para diferenciar lo programado de lo
  reactivo/oportunista), con fecha, estado y responsable. Incluye filtro
  rápido Todas / Planificadas / No planificadas.
- **Indicadores de esta labor**: KPIs ligados a esa labor concreta.

### Indicadores de éxito
- Tabla global de indicadores (ligados a una labor o generales de la
  organización): valor objetivo, valor actual y % completado con barra de
  progreso.
- Resumen con el progreso global de todas las labores.

### Bilingüe y "como una app"
- Selector de idioma ES/EN persistente en la URL (`/es/...`, `/en/...`).
- Manifest + iconos PWA: en el móvil se puede "Añadir a pantalla de inicio"
  y se abre a pantalla completa, como una app nativa.

---

## 2. Stack técnico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) + TypeScript |
| Estilos | Tailwind CSS 4 |
| Base de datos | SQLite (desarrollo) vía Prisma ORM 7 + `@prisma/adapter-better-sqlite3` |
| Internacionalización | next-intl (rutas `/es`, `/en`) |
| Validación | Zod |
| Iconos | lucide-react + iconos PWA generados con `next/og` |

**¿Por qué una API REST separada del front?** Todas las operaciones (crear,
editar, borrar labores, contactos, acciones e indicadores) pasan por
endpoints REST bajo `/api/...` (ver más abajo). Esto significa que, si en el
futuro se quiere construir una app móvil nativa (iOS/Android) o una app de
escritorio, **puede reutilizar esta misma API** sin duplicar lógica de
negocio — la web es un cliente más de esa API.

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

---

## 4. Modelo de datos

```
AdvocacyGoal (labor)
 ├─ contacts[]     → a quién contactar (DECISION_MAKER | SUPPORTER)
 ├─ subtasks[]     → acciones: LETTER | CALL | MEETING | ENCOUNTER | CAMPAIGN | OTHER
 │                    (isPlanned: true/false, status: pending/en curso/hecho/cancelado)
 └─ indicators[]   → KPIs ligados a esta labor

Indicator (también puede existir sin `goal` → indicador general de la entidad)
```

Esquema completo en [`prisma/schema.prisma`](./prisma/schema.prisma).

## 5. API REST

| Recurso | Endpoints |
|---|---|
| Labores | `GET/POST /api/goals`, `GET/PATCH/DELETE /api/goals/:id` |
| Contactos | `POST /api/goals/:id/contacts`, `PATCH/DELETE /api/contacts/:id` |
| Acciones | `POST /api/goals/:id/subtasks`, `PATCH/DELETE /api/subtasks/:id` |
| Indicadores | `GET/POST /api/indicators`, `PATCH/DELETE /api/indicators/:id` |

Todos los cuerpos de petición se validan con Zod (`src/lib/validation.ts`).

---

## 6. Ideas para seguir mejorando

Esto cubre lo pedido inicialmente. Cosas típicas en este tipo de herramienta
de incidencia política que **no** están implementadas todavía, por si
interesa añadirlas más adelante:

- **Directorio de contactos compartido**: hoy cada contacto pertenece a una
  labor; podría existir un directorio central de "stakeholders" (políticos,
  instituciones, medios) reutilizable entre varias labores, con histórico de
  interacciones.
- **Usuarios y roles** (admin / editor / solo lectura), con inicio de sesión
  — ahora mismo cualquiera que acceda a la web puede editar todo.
- **Calendario / vista de línea de tiempo** de próximas acciones y plazos.
- **Adjuntar documentos** a una acción (la carta enviada, el acta de la
  reunión, la foto del encuentro...).
- **Recordatorios/notificaciones** de plazos próximos o vencidos.
- **Historial de cambios** (quién modificó qué y cuándo) para rendir cuentas
  ante la junta directiva.
- **Exportar informes** (PDF/Excel) para reuniones de junta o memoria anual.
- **Página pública de transparencia** con un resumen de logros, separada del
  panel de administración interno.

## 7. English summary

PATHSapp tracks a hemophilia patient organization's advocacy and lobbying
work: goals (either *action*-type or *outcome*-type), who owns each one, the
people/institutions to contact (decision-makers vs. supporters), the concrete
actions under each goal (letters, calls, meetings, encounters, campaigns —
planned or unplanned), and success indicators with target/current values and
% completion. It's bilingual (ES/EN) and installable as a PWA on mobile. All
mutations go through a REST API (`/api/...`) so a future native mobile app
could reuse the same backend. See the sections above for setup, data model,
and suggested next features.
