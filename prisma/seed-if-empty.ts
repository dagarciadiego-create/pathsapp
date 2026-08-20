// Runs as part of every build (see package.json's "build" script), right
// after migrations. Unlike prisma/seed.ts (a destructive reset used for
// local development), this script never deletes anything: it only fills a
// brand-new, empty database with a handful of bilingual example entries so
// the very first person who opens the deployed app sees it "filled in" —
// with every feature represented, not just goals — instead of blank. As
// soon as any goal exists — this example data or real data the
// organization entered — it becomes a permanent no-op, so it can never
// touch real production data on later deploys.
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { resolveDatabaseUrl } from "../src/lib/database-url";
import { TEAMS } from "../src/lib/teams";

const adapter = new PrismaPg({ connectionString: resolveDatabaseUrl() });
const prisma = new PrismaClient({ adapter });

async function main() {
  const existing = await prisma.advocacyGoal.count();
  if (existing > 0) {
    console.log("Example seed skipped: the database already has data.");
    return;
  }

  // Every team gets its own copy of the same example set, so all ten
  // groups in the room open the app on an identical filled-in workspace
  // and their challenge work never collides.
  //
  // One transaction per team: a crash can't leave a half-populated team
  // behind once the emptiness guard above has tripped, and a team that
  // already succeeded isn't rolled back by a later failure.
  for (const team of TEAMS) {
    await prisma.$transaction(async (tx) => {
      // ---------------------------------------------------------------
      // Spanish-language example: one OUTCOME goal fleshed out with every
      // close-orbit feature (contacts, stance history, a door-opener
      // connection, a commitment, a deadline), plus a lighter ACTION goal.
      // ---------------------------------------------------------------
      const elenaEs = await tx.contact.create({
        data: {
          team,
          name: "Dra. Elena Ruiz (ejemplo)",
          organization: "Sociedad Española de Trombosis y Hemostasia (SETH)",
          role: "Vocal de hemofilia",
          email: "elena.ruiz@example.org",
          notes: "Puedes editar o eliminar este contacto de ejemplo cuando quieras.",
        },
      });
      const federEs = await tx.contact.create({
        data: {
          team,
          name: "Federación Española de Enfermedades Raras (ejemplo)",
          role: "Aliado",
          notes: "Puedes editar o eliminar este contacto de ejemplo cuando quieras.",
        },
      });

      const goalEsOutcome = await tx.advocacyGoal.create({
        data: {
          team,
          name: "EJEMPLO — Financiación pública de un tratamiento innovador",
          kind: "OUTCOME",
          responsible: "María López (ejemplo)",
          category: "Acceso a tratamiento",
          description:
            "Contenido de ejemplo para que veas cómo quedan los campos rellenos: conseguir que el Ministerio de Sanidad incluya un nuevo tratamiento en la cartera común de servicios. Puedes editarlo o eliminarlo cuando quieras: no afecta a nada más de la aplicación.",
          targetDate: new Date("2026-12-31"),
          status: "IN_PROGRESS",
          subtasks: {
            create: [
              {
                name: "Carta formal solicitando reunión al Ministerio de Sanidad",
                actionType: "LETTER",
                isPlanned: true,
                status: "DONE",
                responsible: "María López (ejemplo)",
              },
              {
                name: "Reunión con la Dirección General de Cartera Común de Servicios",
                actionType: "MEETING",
                isPlanned: true,
                status: "PENDING",
                responsible: "María López (ejemplo)",
              },
              {
                name: "Informe técnico de la SETH sobre coste-efectividad",
                actionType: "OTHER",
                isPlanned: true,
                status: "IN_PROGRESS",
                responsible: "Dra. Elena Ruiz (ejemplo)",
              },
            ],
          },
          indicators: {
            create: [
              {
                team,
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
          team,
          name: "EJEMPLO — Campaña de sensibilización en redes sociales",
          kind: "ACTION",
          responsible: "María López (ejemplo)",
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

      // Elena's link is created individually (not in the createMany batch
      // below) so its id is available for the stance history right after —
      // she moved from skeptical to a champion over a couple of months.
      const elenaOnGoalEs = await tx.goalContact.create({
        data: {
          goalId: goalEsOutcome.id,
          contactId: elenaEs.id,
          relation: "SUPPORTER",
          notes: "Puede avalar la petición con evidencia clínica.",
          stance: "CHAMPION",
        },
      });
      await tx.goalContact.create({
        data: { goalId: goalEsOutcome.id, contactId: federEs.id, relation: "SUPPORTER" },
      });
      await tx.stanceChange.createMany({
        data: [
          {
            goalContactId: elenaOnGoalEs.id,
            stance: "SKEPTICAL",
            note: "Inicialmente reticente por el coste estimado.",
            changedAt: new Date("2026-05-15"),
          },
          {
            goalContactId: elenaOnGoalEs.id,
            stance: "CHAMPION",
            note: "Cambió de postura tras revisar el estudio de coste-efectividad.",
            changedAt: new Date("2026-07-10"),
          },
        ],
      });

      await tx.contactConnection.create({
        data: {
          contactAId: federEs.id,
          contactBId: elenaEs.id,
          description:
            "Colaboran habitualmente en un grupo de trabajo conjunto; puede facilitar una presentación.",
        },
      });

      await tx.commitment.create({
        data: {
          contactId: elenaEs.id,
          goalId: goalEsOutcome.id,
          description: "Se comprometió a presentar el informe de coste-efectividad en el próximo pleno.",
          madeDate: new Date("2026-07-10"),
          followUpDate: new Date("2026-09-15"),
          status: "PENDING",
        },
      });

      await tx.deadline.create({
        data: {
          team,
          title: "Consulta pública sobre actualización de la cartera de servicios",
          kind: "PUBLIC_CONSULTATION",
          description: "Ventana para presentar alegaciones antes de que se cierre el trámite.",
          dueDate: new Date("2026-09-01"),
          responsible: "María López (ejemplo)",
          status: "OPEN",
          goalId: goalEsOutcome.id,
        },
      });

      // ---------------------------------------------------------------
      // English-language mirror, so an English-locale visitor sees
      // natively-written examples too, not translated-in-place Spanish.
      // ---------------------------------------------------------------
      const elenaEn = await tx.contact.create({
        data: {
          team,
          name: "Dr. Elena Ruiz (example)",
          organization: "Spanish Society of Thrombosis and Haemostasis (SETH)",
          role: "Haemophilia officer",
          email: "elena.ruiz@example.org",
          notes: "Feel free to edit or delete this example contact whenever you like.",
        },
      });
      const federEn = await tx.contact.create({
        data: {
          team,
          name: "Spanish Federation of Rare Diseases (example)",
          role: "Ally",
          notes: "Feel free to edit or delete this example contact whenever you like.",
        },
      });

      const goalEnOutcome = await tx.advocacyGoal.create({
        data: {
          team,
          name: "EXAMPLE — Public funding for an innovative treatment",
          kind: "OUTCOME",
          responsible: "Jane Doe (example)",
          category: "Access to treatment",
          description:
            "Example content so you can see what filled-in fields look like: getting the Ministry of Health to include a new treatment in the common services portfolio. Feel free to edit or delete it: it doesn't affect anything else in the app.",
          targetDate: new Date("2026-12-31"),
          status: "IN_PROGRESS",
          subtasks: {
            create: [
              {
                name: "Formal letter requesting a meeting with the Ministry of Health",
                actionType: "LETTER",
                isPlanned: true,
                status: "DONE",
                responsible: "Jane Doe (example)",
              },
              {
                name: "Meeting with the Common Services Portfolio Directorate",
                actionType: "MEETING",
                isPlanned: true,
                status: "PENDING",
                responsible: "Jane Doe (example)",
              },
              {
                name: "SETH technical report on cost-effectiveness",
                actionType: "OTHER",
                isPlanned: true,
                status: "IN_PROGRESS",
                responsible: "Dr. Elena Ruiz (example)",
              },
            ],
          },
          indicators: {
            create: [
              {
                team,
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
          team,
          name: "EXAMPLE — Social media awareness campaign",
          kind: "ACTION",
          responsible: "Jane Doe (example)",
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

      const elenaOnGoalEn = await tx.goalContact.create({
        data: {
          goalId: goalEnOutcome.id,
          contactId: elenaEn.id,
          relation: "SUPPORTER",
          notes: "Can back the ask with clinical evidence.",
          stance: "CHAMPION",
        },
      });
      await tx.goalContact.create({
        data: { goalId: goalEnOutcome.id, contactId: federEn.id, relation: "SUPPORTER" },
      });
      await tx.stanceChange.createMany({
        data: [
          {
            goalContactId: elenaOnGoalEn.id,
            stance: "SKEPTICAL",
            note: "Initially reluctant given the estimated cost.",
            changedAt: new Date("2026-05-15"),
          },
          {
            goalContactId: elenaOnGoalEn.id,
            stance: "CHAMPION",
            note: "Came around after reviewing the cost-effectiveness study.",
            changedAt: new Date("2026-07-10"),
          },
        ],
      });

      await tx.contactConnection.create({
        data: {
          contactAId: federEn.id,
          contactBId: elenaEn.id,
          description:
            "They regularly work together in a joint working group; could help set up an introduction.",
        },
      });

      await tx.commitment.create({
        data: {
          contactId: elenaEn.id,
          goalId: goalEnOutcome.id,
          description: "Committed to presenting the cost-effectiveness report at the next plenary.",
          madeDate: new Date("2026-07-10"),
          followUpDate: new Date("2026-09-15"),
          status: "PENDING",
        },
      });

      await tx.deadline.create({
        data: {
          team,
          title: "Public consultation on updating the common services portfolio",
          kind: "PUBLIC_CONSULTATION",
          description: "Window to submit comments before the process closes.",
          dueDate: new Date("2026-09-01"),
          responsible: "Jane Doe (example)",
          status: "OPEN",
          goalId: goalEnOutcome.id,
        },
      });

      // ---------------------------------------------------------------
      // Whole-organization reference data (positions, calendar, roster,
      // petitions, joint letters, media log): these describe one real
      // organization rather than per-locale content, so a single Spanish
      // example set covers them — same approach prisma/seed.ts uses for
      // its richer local-development dataset.
      // ---------------------------------------------------------------
      const martaEjemplo = await tx.contact.create({
        data: {
          team,
          name: "Marta Sánchez (ejemplo)",
          organization: "Gobierno de España",
          role: "Exministra de Sanidad (ejemplo)",
        },
      });
      const carlosEjemplo = await tx.contact.create({
        data: {
          team,
          name: "Carlos Ferrer (ejemplo)",
          organization: "Gobierno de España",
          role: "Ministro de Sanidad (ejemplo)",
        },
      });
      const ministroEjemplo = await tx.position.create({
        data: {
          team,
          title: "Ministro/a de Sanidad (ejemplo)",
          organization: "Gobierno de España",
        },
      });
      await tx.positionHolder.createMany({
        data: [
          {
            positionId: ministroEjemplo.id,
            contactId: martaEjemplo.id,
            startDate: new Date("2022-01-10"),
            endDate: new Date("2024-11-20"),
          },
          {
            positionId: ministroEjemplo.id,
            contactId: carlosEjemplo.id,
            startDate: new Date("2024-11-20"),
          },
        ],
      });

      await tx.strategicDate.createMany({
        data: [
          {
            team,
            title: "Día Mundial de la Hemofilia (ejemplo)",
            kind: "AWARENESS_DAY",
            date: new Date("2026-04-17"),
            description: "Fecha clave para campañas de sensibilización y visibilidad mediática.",
            isRecurring: true,
          },
          {
            team,
            title: "Presentación de los Presupuestos Generales del Estado (ejemplo)",
            kind: "BUDGET",
            date: new Date("2026-10-01"),
            description: "Ventana crítica para incidir en la financiación pública de tratamientos.",
            isRecurring: true,
          },
        ],
      });

      await tx.spokesperson.create({
        data: {
          team,
          name: "María López (ejemplo)",
          role: "Vicepresidenta, Junta Directiva",
          topics: "Acceso a tratamiento, financiación pública, relaciones institucionales",
          bio: "Portavoz habitual ante medios sobre el acceso al tratamiento. Puedes editar o eliminar este ejemplo.",
          mediaTrained: true,
        },
      });

      const peticionEjemplo = await tx.petition.create({
        data: {
          team,
          title: "EJEMPLO — Acceso universal a un tratamiento innovador",
          category: "Acceso a tratamiento",
        },
      });
      await tx.petitionVersion.create({
        data: {
          petitionId: peticionEjemplo.id,
          contentEs:
            "Solicitamos que el Ministerio de Sanidad valore la inclusión del nuevo tratamiento para los casos graves.",
          createdAt: new Date("2025-11-01"),
        },
      });
      await tx.petitionVersion.create({
        data: {
          petitionId: peticionEjemplo.id,
          contentEs:
            "Solicitamos el acceso universal y gratuito al nuevo tratamiento para todos los pacientes, no solo los casos graves, dentro de la cartera común de servicios.",
          contentEn:
            "We request universal, free access to the new treatment for all patients, not only severe cases, within the common services portfolio.",
          notes: "Ampliada tras el informe de coste-efectividad. Ejemplo editable.",
          createdAt: new Date("2026-06-20"),
        },
      });
      await tx.evidence.create({
        data: {
          team,
          petitionId: peticionEjemplo.id,
          title: "Informe técnico sobre coste-efectividad (ejemplo)",
          source: "Sociedad científica de referencia",
          summary: "Estudio que respalda extender la cobertura a todos los pacientes.",
        },
      });

      const cartaEjemplo = await tx.jointLetter.create({
        data: {
          team,
          title: "EJEMPLO — Carta conjunta a favor de la financiación universal",
          targetName: "Ministerio de Sanidad (ejemplo)",
          sentDate: new Date("2026-05-20"),
          goalId: goalEsOutcome.id,
          content:
            "Las organizaciones abajo firmantes solicitamos conjuntamente la inclusión universal del nuevo tratamiento en la cartera común de servicios.",
        },
      });
      await tx.jointLetterCosigner.createMany({
        data: [
          {
            jointLetterId: cartaEjemplo.id,
            organization: "Federación Española de Enfermedades Raras (ejemplo)",
            status: "SIGNED",
          },
          {
            jointLetterId: cartaEjemplo.id,
            organization: "Sociedad científica de referencia (ejemplo)",
            contactName: "Dra. Elena Ruiz (ejemplo)",
            status: "CONFIRMED",
          },
          {
            jointLetterId: cartaEjemplo.id,
            organization: "Plataforma de Organizaciones de Pacientes (ejemplo)",
            status: "INVITED",
          },
        ],
      });

      await tx.mediaCoverage.createMany({
        data: [
          {
            team,
            outlet: "Televisión Regional (ejemplo)",
            title: "Piden financiación universal para el nuevo tratamiento (ejemplo)",
            publishedDate: new Date("2026-04-18"),
            tone: "POSITIVE",
            reach: 45000,
            goalId: goalEsOutcome.id,
          },
          {
            team,
            outlet: "Diario Sanitario (ejemplo)",
            title: "El coste de ampliar la cobertura genera debate (ejemplo)",
            publishedDate: new Date("2026-06-02"),
            tone: "NEUTRAL",
            reach: 12000,
            goalId: goalEsOutcome.id,
          },
        ],
      });
    });
  }

  console.log(
    "Example seed created: 4 goals (2 ES + 2 EN) plus one shared example of every other feature (deadlines, commitments, connections, stance history, positions, strategic dates, spokespeople, petitions, joint letters, media coverage)."
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
