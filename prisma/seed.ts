import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { resolveDatabaseUrl } from "../src/lib/database-url";

const adapter = new PrismaPg({ connectionString: resolveDatabaseUrl() });
const prisma = new PrismaClient({ adapter });

async function main() {
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
      name: "Dirección General de Cartera Común de Servicios",
      organization: "Ministerio de Sanidad",
      role: "Órgano decisor",
      email: "cartera.servicios@sanidad.gob.es",
      notes: "Es quien formalmente aprueba la inclusión en cartera.",
    },
  });
  const ministerioCalidad = await prisma.contact.create({
    data: {
      name: "Subdirección de Calidad y Cohesión",
      organization: "Ministerio de Sanidad",
      role: "Responsable de registros de enfermedades raras",
    },
  });
  const drElenaRuiz = await prisma.contact.create({
    data: {
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
      name: "Diputado Portavoz de Sanidad",
      organization: "Comisión de Sanidad del Congreso",
      role: "Portavoz",
    },
  });
  const feder = await prisma.contact.create({
    data: {
      name: "Federación Española de Enfermedades Raras (FEDER)",
      role: "Aliado",
      email: "info@feder.org",
    },
  });
  const redaccionSalud = await prisma.contact.create({
    data: {
      name: "Redacción de Salud",
      organization: "Televisión regional",
      role: "Contacto de prensa",
      email: "salud@tvregional.es",
    },
  });
  // A contact in the directory not linked to any goal yet.
  await prisma.contact.create({
    data: {
      name: "Concejalía de Sanidad y Bienestar Social",
      organization: "Ayuntamiento",
      role: "Posible aliado local",
      notes: "Contacto reciente en el Día Mundial, todavía sin asignar a una labor.",
    },
  });

  const financiacion = await prisma.advocacyGoal.create({
    data: {
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
            name: "Impactos en medios de comunicación",
            targetValue: 20,
            currentValue: 6,
            unit: "impactos",
          },
          {
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
  await prisma.goalContact.createMany({
    data: [
      {
        goalId: financiacion.id,
        contactId: ministerioCartera.id,
        relation: "DECISION_MAKER",
      },
      {
        goalId: financiacion.id,
        contactId: drElenaRuiz.id,
        relation: "SUPPORTER",
        notes: "Puede avalar la petición con evidencia clínica.",
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
      name: "Satisfacción general de los socios con la labor de incidencia",
      targetValue: 9,
      currentValue: 7.2,
      unit: "/10",
    },
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
