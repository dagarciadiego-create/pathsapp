import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { resolveDatabaseUrl } from "../src/lib/database-url";
import { TEAMS } from "../src/lib/teams";

const adapter = new PrismaPg({ connectionString: resolveDatabaseUrl() });
const prisma = new PrismaClient({ adapter });

// Everything below belongs to one team. That's deliberate: this is the
// local development fixture, so a single team is enough to work against,
// and it matches the team the team-scoping migration backfilled into.
const TEAM = TEAMS[0];

async function main() {
  await prisma.evidence.deleteMany();
  await prisma.petitionVersion.deleteMany();
  await prisma.petition.deleteMany();
  await prisma.jointLetterCosigner.deleteMany();
  await prisma.jointLetter.deleteMany();
  await prisma.mediaCoverage.deleteMany();
  await prisma.strategicDate.deleteMany();
  await prisma.positionHolder.deleteMany();
  await prisma.position.deleteMany();
  await prisma.deadline.deleteMany();
  await prisma.stanceChange.deleteMany();
  await prisma.commitment.deleteMany();
  await prisma.contactConnection.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.indicator.deleteMany();
  await prisma.goalContact.deleteMany();
  await prisma.subtask.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.advocacyGoal.deleteMany();

  // --- Shared contact directory -------------------------------------
  // "Ministerio de Sanidad" is relevant to two different goals below,
  // which is exactly why contacts live in a shared directory instead of
  // being duplicated per goal.
  const ministerioCartera = await prisma.contact.create({
    data: {
      team: TEAM,
      name: "Dirección General de Cartera Común de Servicios",
      organization: "Ministerio de Sanidad",
      role: "Órgano decisor",
      email: "cartera.servicios@sanidad.gob.es",
      notes: "Es quien formalmente aprueba la inclusión en cartera.",
    },
  });
  const ministerioCalidad = await prisma.contact.create({
    data: {
      team: TEAM,
      name: "Subdirección de Calidad y Cohesión",
      organization: "Ministerio de Sanidad",
      role: "Responsable de registros de enfermedades raras",
    },
  });
  const drElenaRuiz = await prisma.contact.create({
    data: {
      team: TEAM,
      name: "Dra. Elena Ruiz",
      organization: "Sociedad Española de Trombosis y Hemostasia (SETH)",
      role: "Vocal de hemofilia",
      email: "eruiz@seth-es.org",
      phone: "+34 600 111 222",
      notes: "Puede avalar peticiones con evidencia clínica.",
    },
  });
  const diputadoSanidad = await prisma.contact.create({
    data: {
      team: TEAM,
      name: "Diputado Portavoz de Sanidad",
      organization: "Comisión de Sanidad del Congreso",
      role: "Portavoz",
    },
  });
  const feder = await prisma.contact.create({
    data: {
      team: TEAM,
      name: "Federación Española de Enfermedades Raras (FEDER)",
      role: "Aliado",
      email: "info@feder.org",
    },
  });
  const redaccionSalud = await prisma.contact.create({
    data: {
      team: TEAM,
      name: "Redacción de Salud",
      organization: "Televisión regional",
      role: "Contacto de prensa",
      email: "salud@tvregional.es",
    },
  });
  // A contact in the directory not linked to any goal yet.
  await prisma.contact.create({
    data: {
      team: TEAM,
      name: "Concejalía de Sanidad y Bienestar Social",
      organization: "Ayuntamiento",
      role: "Posible aliado local",
      notes: "Contacto reciente en el Día Mundial, todavía sin asignar a una labor.",
    },
  });
  // Two more directory contacts, used below as the successive holders of
  // the "Ministro/a de Sanidad" position (see Position/PositionHolder).
  const martaSanchez = await prisma.contact.create({
    data: {
      team: TEAM,
      name: "Marta Sánchez Ibáñez",
      organization: "Gobierno de España",
      role: "Exministra de Sanidad (2022-2024)",
    },
  });
  const carlosFerrer = await prisma.contact.create({
    data: {
      team: TEAM,
      name: "Carlos Ferrer Puig",
      organization: "Gobierno de España",
      role: "Ministro de Sanidad",
      email: "gabinete.ministro@sanidad.gob.es",
    },
  });

  const financiacion = await prisma.advocacyGoal.create({
    data: {
      team: TEAM,
      name: "Financiación pública de la profilaxis con factores de vida media prolongada",
      kind: "OUTCOME",
      responsible: "María López (Junta Directiva)",
      category: "Acceso a tratamiento",
      description:
        "Conseguir que el Ministerio de Sanidad incluya los factores de coagulación de vida media prolongada en la cartera común de servicios para todos los pacientes con hemofilia A y B, no solo casos graves.",
      targetDate: new Date("2026-12-15"),
      status: "IN_PROGRESS",
      subtasks: {
        create: [
          {
            name: "Carta formal solicitando reunión a la Dirección General de Cartera Común",
            actionType: "LETTER",
            isPlanned: true,
            dueDate: new Date("2026-08-10"),
            status: "DONE",
            responsible: "María López",
          },
          {
            name: "Reunión con la Dirección General de Cartera Común de Servicios",
            actionType: "MEETING",
            isPlanned: true,
            dueDate: new Date("2026-09-05"),
            status: "PENDING",
            responsible: "María López",
          },
          {
            name: "Informe técnico-clínico de la SETH sobre coste-efectividad",
            actionType: "OTHER",
            isPlanned: true,
            dueDate: new Date("2026-09-20"),
            status: "IN_PROGRESS",
            responsible: "Dra. Elena Ruiz",
          },
          {
            name: "Llamada urgente al gabinete del diputado tras filtrarse un recorte",
            actionType: "CALL",
            isPlanned: false,
            dueDate: new Date("2026-07-22"),
            status: "DONE",
            responsible: "María López",
            notes: "Acción no planificada: reacción a una noticia de prensa.",
          },
        ],
      },
      indicators: {
        create: [
          {
            team: TEAM,
            name: "% de pacientes con acceso a profilaxis de vida media prolongada",
            targetValue: 100,
            currentValue: 42,
            unit: "%",
          },
        ],
      },
    },
  });

  const registro = await prisma.advocacyGoal.create({
    data: {
      team: TEAM,
      name: "Puesta en marcha del Registro Nacional de Hemofilia",
      kind: "OUTCOME",
      responsible: "Javier Torres (Coordinador de Incidencia Política)",
      category: "Datos y registro",
      description:
        "Lograr que las Comunidades Autónomas alimenten un registro nacional único de pacientes con hemofilia para mejorar la planificación sanitaria.",
      targetDate: new Date("2027-03-01"),
      status: "NOT_STARTED",
      subtasks: {
        create: [
          {
            name: "Reunión conjunta con FEDER para alinear estrategia",
            actionType: "MEETING",
            isPlanned: true,
            dueDate: new Date("2026-10-01"),
            status: "PENDING",
            responsible: "Javier Torres",
          },
          {
            name: "Campaña de recogida de firmas de pacientes",
            actionType: "CAMPAIGN",
            isPlanned: true,
            dueDate: new Date("2026-11-15"),
            status: "PENDING",
            responsible: "Javier Torres",
          },
        ],
      },
      indicators: {
        create: [
          {
            team: TEAM,
            name: "Comunidades Autónomas que alimentan el registro",
            targetValue: 17,
            currentValue: 0,
            unit: "CC. AA.",
          },
        ],
      },
    },
  });

  const sensibilizacion = await prisma.advocacyGoal.create({
    data: {
      team: TEAM,
      name: "Campaña de sensibilización 'Hemofilia Visible' en el Día Mundial",
      kind: "ACTION",
      responsible: "Ana Belén Gómez (Comunicación)",
      category: "Sensibilización",
      description:
        "Organizar actividades de calle, redes sociales y encuentros con medios para el Día Mundial de la Hemofilia (17 de abril) para dar visibilidad al colectivo.",
      targetDate: new Date("2027-04-17"),
      status: "IN_PROGRESS",
      subtasks: {
        create: [
          {
            name: "Encuentro con pacientes y familias en la sede regional",
            actionType: "ENCOUNTER",
            isPlanned: true,
            dueDate: new Date("2027-04-10"),
            status: "PENDING",
            responsible: "Ana Belén Gómez",
          },
          {
            name: "Nota de prensa y rueda de prensa conjunta",
            actionType: "OTHER",
            isPlanned: true,
            dueDate: new Date("2027-04-16"),
            status: "PENDING",
            responsible: "Ana Belén Gómez",
          },
          {
            name: "Llamada a un influencer sanitario que se ofreció a difundir la campaña",
            actionType: "CALL",
            isPlanned: false,
            status: "PENDING",
            responsible: "Ana Belén Gómez",
            notes: "Contacto surgido de forma espontánea en redes sociales.",
          },
        ],
      },
      indicators: {
        create: [
          {
            team: TEAM,
            name: "Impactos en medios de comunicación",
            targetValue: 20,
            currentValue: 6,
            unit: "impactos",
          },
          {
            team: TEAM,
            name: "Personas alcanzadas en redes sociales",
            targetValue: 50000,
            currentValue: 12500,
            unit: "personas",
          },
        ],
      },
    },
  });

  const centroReferencia = await prisma.advocacyGoal.create({
    data: {
      team: TEAM,
      name: "Reconocimiento de la unidad de referencia en hemofilia",
      kind: "OUTCOME",
      responsible: "María López (Junta Directiva)",
      category: "Acceso a tratamiento",
      description:
        "Conseguir que la Consejería de Sanidad reconociera oficialmente la unidad hospitalaria como centro de referencia (CSUR) para el tratamiento de la hemofilia en la región.",
      targetDate: new Date("2026-02-10"),
      status: "ACHIEVED",
      subtasks: {
        create: [
          {
            name: "Carta de solicitud de reconocimiento CSUR",
            actionType: "LETTER",
            isPlanned: true,
            dueDate: new Date("2025-11-05"),
            status: "DONE",
            responsible: "María López",
          },
          {
            name: "Reunión de seguimiento con la Consejería",
            actionType: "MEETING",
            isPlanned: true,
            dueDate: new Date("2026-01-20"),
            status: "DONE",
            responsible: "María López",
          },
        ],
      },
    },
  });

  // --- Link directory contacts to goals ------------------------------
  // Elena Ruiz's link is created individually (not in the createMany batch
  // below) so its id is available for the StanceChange history further
  // down — she moved from skeptical to a champion over the year.
  const elenaRuizOnFinanciacion = await prisma.goalContact.create({
    data: {
      goalId: financiacion.id,
      contactId: drElenaRuiz.id,
      relation: "SUPPORTER",
      notes: "Puede avalar la petición con evidencia clínica.",
      stance: "CHAMPION",
    },
  });

  await prisma.goalContact.createMany({
    data: [
      {
        goalId: financiacion.id,
        contactId: ministerioCartera.id,
        relation: "DECISION_MAKER",
      },
      {
        goalId: financiacion.id,
        contactId: diputadoSanidad.id,
        relation: "SUPPORTER",
        notes: "Puede impulsar una pregunta parlamentaria.",
      },
      {
        goalId: registro.id,
        contactId: ministerioCalidad.id,
        relation: "DECISION_MAKER",
      },
      { goalId: registro.id, contactId: feder.id, relation: "SUPPORTER" },
      // The Ministry of Health funding contact is also relevant here —
      // this is the same directory record used in two different goals.
      {
        goalId: registro.id,
        contactId: ministerioCartera.id,
        relation: "SUPPORTER",
        notes: "También puede ayudar a impulsar el registro desde su área.",
      },
      { goalId: sensibilizacion.id, contactId: redaccionSalud.id, relation: "SUPPORTER" },
    ],
  });

  // A global indicator not tied to a single goal.
  await prisma.indicator.create({
    data: {
      team: TEAM,
      name: "Satisfacción general de los socios con la labor de incidencia",
      targetValue: 9,
      currentValue: 7.2,
      unit: "/10",
    },
  });

  // --- Stance history: Elena Ruiz warmed up over the year -----------
  await prisma.stanceChange.createMany({
    data: [
      {
        goalContactId: elenaRuizOnFinanciacion.id,
        stance: "SKEPTICAL",
        note: "Inicialmente reticente por el coste estimado para el sistema.",
        changedAt: new Date("2026-05-15"),
      },
      {
        goalContactId: elenaRuizOnFinanciacion.id,
        stance: "CHAMPION",
        note: "Cambió de postura tras revisar el estudio de coste-efectividad de la SETH.",
        changedAt: new Date("2026-07-10"),
      },
    ],
  });

  // --- Door-opener connection between two contacts -------------------
  await prisma.contactConnection.create({
    data: {
      contactAId: feder.id,
      contactBId: drElenaRuiz.id,
      description:
        "Colaboran habitualmente en el grupo de trabajo de enfermedades raras; FEDER puede facilitar una presentación.",
    },
  });

  // --- A promise made to us, not an action we took --------------------
  await prisma.commitment.create({
    data: {
      contactId: drElenaRuiz.id,
      goalId: financiacion.id,
      description:
        "Se comprometió a presentar el informe de coste-efectividad en el próximo pleno de la SETH.",
      madeDate: new Date("2026-07-10"),
      followUpDate: new Date("2026-09-15"),
      status: "PENDING",
    },
  });

  // --- An external window we need to act within -----------------------
  await prisma.deadline.create({
    data: {
      team: TEAM,
      title: "Consulta pública sobre actualización de la cartera común de servicios",
      kind: "PUBLIC_CONSULTATION",
      description: "Ventana para presentar alegaciones antes de que se cierre el trámite.",
      dueDate: new Date("2026-09-01"),
      responsible: "María López",
      status: "OPEN",
      goalId: financiacion.id,
    },
  });

  // --- A position tracked separately from who currently holds it ------
  const ministroSanidad = await prisma.position.create({
    data: {
      team: TEAM,
      title: "Ministro/a de Sanidad",
      organization: "Gobierno de España",
    },
  });
  await prisma.positionHolder.createMany({
    data: [
      {
        positionId: ministroSanidad.id,
        contactId: martaSanchez.id,
        startDate: new Date("2022-01-10"),
        endDate: new Date("2024-11-20"),
      },
      {
        positionId: ministroSanidad.id,
        contactId: carlosFerrer.id,
        startDate: new Date("2024-11-20"),
      },
    ],
  });

  // --- Strategic calendar overlay --------------------------------------
  await prisma.strategicDate.createMany({
    data: [
      {
        team: TEAM,
        title: "Día Mundial de la Hemofilia",
        kind: "AWARENESS_DAY",
        date: new Date("2026-04-17"),
        description: "Fecha clave para campañas de sensibilización y visibilidad mediática.",
        isRecurring: true,
      },
      {
        team: TEAM,
        title: "Presentación de los Presupuestos Generales del Estado",
        kind: "BUDGET",
        date: new Date("2026-10-01"),
        description: "Ventana crítica para incidir en la financiación pública de tratamientos.",
        isRecurring: true,
      },
    ],
  });

  // --- Designated spokesperson ------------------------------------------
  await prisma.spokesperson.create({
    data: {
      team: TEAM,
      name: "María López",
      role: "Vicepresidenta, Junta Directiva",
      topics: "Acceso a tratamiento, financiación pública, relaciones institucionales",
      bio: "Portavoz habitual ante medios nacionales y autonómicos sobre el acceso al tratamiento.",
      mediaTrained: true,
    },
  });

  // --- Petition & evidence library ---------------------------------------
  const peticionProfilaxis = await prisma.petition.create({
    data: {
      team: TEAM,
      title: "Acceso universal a la profilaxis con factores de vida media prolongada",
      category: "Acceso a tratamiento",
    },
  });
  await prisma.petitionVersion.create({
    data: {
      petitionId: peticionProfilaxis.id,
      contentEs:
        "Solicitamos que el Ministerio de Sanidad valore la inclusión de los factores de coagulación de vida media prolongada para los casos graves de hemofilia A y B.",
      createdAt: new Date("2025-11-01"),
    },
  });
  await prisma.petitionVersion.create({
    data: {
      petitionId: peticionProfilaxis.id,
      contentEs:
        "Solicitamos el acceso universal y gratuito a los factores de coagulación de vida media prolongada para todos los pacientes con hemofilia A y B, no solo los casos graves, dentro de la cartera común de servicios del Sistema Nacional de Salud.",
      contentEn:
        "We request universal, free access to extended half-life coagulation factors for all patients with hemophilia A and B, not only severe cases, within the National Health System's common services portfolio.",
      notes: "Ampliada tras el informe de la SETH sobre coste-efectividad.",
      createdAt: new Date("2026-06-20"),
    },
  });
  await prisma.evidence.create({
    data: {
      team: TEAM,
      petitionId: peticionProfilaxis.id,
      title: "Informe técnico-clínico de la SETH sobre coste-efectividad",
      source: "Sociedad Española de Trombosis y Hemostasia (SETH)",
      summary:
        "Estudio que respalda extender la cobertura a todos los pacientes, no solo a los casos graves.",
    },
  });

  // --- Joint sign-on letter -----------------------------------------------
  const cartaConjunta = await prisma.jointLetter.create({
    data: {
      team: TEAM,
      title: "Carta conjunta a favor de la financiación universal de la profilaxis",
      targetName: "Ministerio de Sanidad",
      sentDate: new Date("2026-05-20"),
      goalId: financiacion.id,
      content:
        "Las organizaciones abajo firmantes solicitamos conjuntamente la inclusión universal de los factores de vida media prolongada en la cartera común de servicios.",
    },
  });
  await prisma.jointLetterCosigner.createMany({
    data: [
      {
        jointLetterId: cartaConjunta.id,
        organization: "Federación Española de Enfermedades Raras (FEDER)",
        status: "SIGNED",
      },
      {
        jointLetterId: cartaConjunta.id,
        organization: "Sociedad Española de Trombosis y Hemostasia (SETH)",
        contactName: "Dra. Elena Ruiz",
        status: "CONFIRMED",
      },
      {
        jointLetterId: cartaConjunta.id,
        organization: "Plataforma de Organizaciones de Pacientes (POP)",
        status: "INVITED",
      },
    ],
  });

  // --- Media coverage log -------------------------------------------------
  await prisma.mediaCoverage.createMany({
    data: [
      {
        team: TEAM,
        outlet: "Televisión Regional",
        title: "Piden financiación universal para el tratamiento de la hemofilia",
        publishedDate: new Date("2026-04-18"),
        tone: "POSITIVE",
        reach: 45000,
        goalId: sensibilizacion.id,
      },
      {
        team: TEAM,
        outlet: "Diario Sanitario",
        title: "El coste de ampliar la cobertura de profilaxis genera debate",
        publishedDate: new Date("2026-06-02"),
        tone: "NEUTRAL",
        reach: 12000,
        goalId: financiacion.id,
      },
    ],
  });

  console.log("Seed complete:", {
    financiacion: financiacion.id,
    registro: registro.id,
    sensibilizacion: sensibilizacion.id,
    centroReferencia: centroReferencia.id,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
