// Runs as part of every build (see package.json's "build" script), right
// after migrations. Unlike prisma/seed.ts (a destructive reset used for
// local development), this script never deletes anything: it only fills a
// brand-new, empty database with a handful of bilingual example entries so
// the very first person who opens the deployed app sees it "filled in"
// instead of blank. As soon as any goal exists — this example data or real
// data the organization entered — it becomes a permanent no-op, so it can
// never touch real production data on later deploys.
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { resolveDatabaseUrl } from "../src/lib/database-url";

const adapter = new PrismaPg({ connectionString: resolveDatabaseUrl() });
const prisma = new PrismaClient({ adapter });

async function main() {
  const existing = await prisma.advocacyGoal.count();
  if (existing > 0) {
    console.log("Example seed skipped: the database already has data.");
    return;
  }

  // Wrapped in a transaction so a crash partway through can't leave a
  // permanently partial example dataset once the emptiness guard above has
  // tripped (e.g. contacts created but never linked to a goal).
  await prisma.$transaction(async (tx) => {
    const contactEs = await tx.contact.create({
      data: {
        name: "Contacto de ejemplo",
        organization: "Organización de ejemplo",
        role: "Cargo de ejemplo",
        email: "contacto.ejemplo@example.org",
        notes: "Puedes editar o eliminar este contacto de ejemplo cuando quieras.",
      },
    });
    const contactEn = await tx.contact.create({
      data: {
        name: "Example contact",
        organization: "Example organization",
        role: "Example role",
        email: "example.contact@example.org",
        notes: "Feel free to edit or delete this example contact whenever you like.",
      },
    });

    const goalEsOutcome = await tx.advocacyGoal.create({
      data: {
        name: "EJEMPLO — Ampliar el acceso a un tratamiento innovador",
        kind: "OUTCOME",
        responsible: "Nombre de la persona responsable",
        category: "Acceso a tratamiento",
        description:
          "Contenido de ejemplo para que veas cómo quedan los campos rellenos. Puedes editarlo o eliminarlo cuando quieras: no afecta a nada más de la aplicación.",
        targetDate: new Date("2026-12-31"),
        status: "IN_PROGRESS",
        subtasks: {
          create: [
            {
              name: "Carta a la Consejería de Sanidad solicitando una reunión",
              actionType: "LETTER",
              isPlanned: true,
              status: "DONE",
              responsible: "Nombre de la persona responsable",
            },
            {
              name: "Reunión con la Dirección General de Farmacia",
              actionType: "MEETING",
              isPlanned: true,
              status: "PENDING",
              responsible: "Nombre de la persona responsable",
            },
          ],
        },
        indicators: {
          create: [
            {
              name: "% de pacientes con acceso al nuevo tratamiento",
              targetValue: 100,
              currentValue: 30,
              unit: "%",
            },
          ],
        },
      },
    });

    await tx.advocacyGoal.create({
      data: {
        name: "EJEMPLO — Campaña de sensibilización en redes sociales",
        kind: "ACTION",
        responsible: "Nombre de la persona responsable",
        category: "Sensibilización",
        description:
          "Segundo ejemplo, esta vez de tipo «Acción». Bórralo en cuanto ya no lo necesites.",
        status: "NOT_STARTED",
        subtasks: {
          create: [
            {
              name: "Diseñar los materiales gráficos de la campaña",
              actionType: "OTHER",
              isPlanned: true,
              status: "PENDING",
            },
            {
              name: "Publicar el primer vídeo de testimonios",
              actionType: "CAMPAIGN",
              isPlanned: true,
              status: "PENDING",
            },
          ],
        },
      },
    });

    const goalEnOutcome = await tx.advocacyGoal.create({
      data: {
        name: "EXAMPLE — Expand access to an innovative treatment",
        kind: "OUTCOME",
        responsible: "Name of the person responsible",
        category: "Access to treatment",
        description:
          "Example content so you can see what filled-in fields look like. Feel free to edit or delete it: it doesn't affect anything else in the app.",
        targetDate: new Date("2026-12-31"),
        status: "IN_PROGRESS",
        subtasks: {
          create: [
            {
              name: "Letter to the Ministry of Health requesting a meeting",
              actionType: "LETTER",
              isPlanned: true,
              status: "DONE",
              responsible: "Name of the person responsible",
            },
            {
              name: "Meeting with the Pharmacy Directorate",
              actionType: "MEETING",
              isPlanned: true,
              status: "PENDING",
              responsible: "Name of the person responsible",
            },
          ],
        },
        indicators: {
          create: [
            {
              name: "% of patients with access to the new treatment",
              targetValue: 100,
              currentValue: 30,
              unit: "%",
            },
          ],
        },
      },
    });

    await tx.advocacyGoal.create({
      data: {
        name: "EXAMPLE — Social media awareness campaign",
        kind: "ACTION",
        responsible: "Name of the person responsible",
        category: "Awareness",
        description:
          "Second example, this time an “Action” type goal. Delete it whenever you no longer need it.",
        status: "NOT_STARTED",
        subtasks: {
          create: [
            {
              name: "Design the campaign's graphic materials",
              actionType: "OTHER",
              isPlanned: true,
              status: "PENDING",
            },
            {
              name: "Publish the first testimonial video",
              actionType: "CAMPAIGN",
              isPlanned: true,
              status: "PENDING",
            },
          ],
        },
      },
    });

    await tx.goalContact.createMany({
      data: [
        { goalId: goalEsOutcome.id, contactId: contactEs.id, relation: "SUPPORTER" },
        { goalId: goalEnOutcome.id, contactId: contactEn.id, relation: "SUPPORTER" },
      ],
    });
  });

  console.log("Example seed created: 4 goals (2 ES + 2 EN) and 2 contacts.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
