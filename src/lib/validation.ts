import { z } from "zod";
import {
  GOAL_KINDS,
  GOAL_STATUSES,
  CONTACT_RELATIONS,
  ACTION_TYPES,
  SUBTASK_STATUSES,
  STANCE_VALUES,
  COMMITMENT_STATUSES,
  DEADLINE_KINDS,
  DEADLINE_STATUSES,
  STRATEGIC_DATE_KINDS,
  COSIGNER_STATUSES,
  MEDIA_TONES,
} from "./constants";

// Empty strings from HTML forms should be treated as "no value", not as an
// invalid date/value.
const emptyToNull = (val: unknown) => (val === "" ? null : val);
const optionalDateString = z.preprocess(
  emptyToNull,
  z
    .string()
    .refine((val) => !Number.isNaN(Date.parse(val)), "Invalid date")
    .nullable()
    .optional()
);
const optionalString = (max: number) =>
  z.preprocess(emptyToNull, z.string().max(max).nullable().optional());
const optionalEmail = z.preprocess(emptyToNull, z.email().max(200).nullable().optional());
// 1-5 triage score (effort/impact); empty string from the form select means
// "not scored yet", same treatment as the other optional fields above.
const optionalScore = z.preprocess(
  emptyToNull,
  z.coerce.number().int().min(1).max(5).nullable().optional()
);
const optionalNonNegativeInt = z.preprocess(
  emptyToNull,
  z.coerce.number().int().nonnegative().nullable().optional()
);

export const goalInputSchema = z.object({
  name: z.string().trim().min(1, "Required").max(200),
  kind: z.enum(GOAL_KINDS),
  responsible: z.string().trim().min(1, "Required").max(200),
  category: optionalString(120),
  description: optionalString(4000),
  targetDate: optionalDateString,
  status: z.enum(GOAL_STATUSES).optional(),
  effortScore: optionalScore,
  impactScore: optionalScore,
});
export const goalUpdateSchema = goalInputSchema.partial();

export const goalDuplicateSchema = z.object({
  name: z.string().trim().min(1, "Required").max(200),
});

export const contactInputSchema = z.object({
  name: z.string().trim().min(1, "Required").max(200),
  organization: optionalString(200),
  role: optionalString(200),
  email: optionalEmail,
  phone: optionalString(60),
  notes: optionalString(2000),
});
export const contactUpdateSchema = contactInputSchema.partial();

// Linking a directory contact to a goal: either reference an existing
// contact by id, or create a brand new one inline (exactly one of the two).
export const goalContactLinkSchema = z
  .object({
    contactId: optionalString(60),
    contact: contactInputSchema.optional(),
    relation: z.enum(CONTACT_RELATIONS),
    notes: optionalString(2000),
  })
  .refine((data) => Boolean(data.contactId) !== Boolean(data.contact), {
    message: "Provide either contactId or contact, not both",
  });

export const goalContactUpdateSchema = z.object({
  relation: z.enum(CONTACT_RELATIONS).optional(),
  notes: optionalString(2000),
  // A stance change is recorded as a new StanceChange row rather than an
  // in-place update, so the history can be charted; stanceNote annotates
  // that one change and isn't stored on GoalContact itself.
  stance: z.enum(STANCE_VALUES).optional(),
  stanceNote: optionalString(500),
  contact: contactInputSchema.partial().optional(),
});

export const subtaskInputSchema = z.object({
  name: z.string().trim().min(1, "Required").max(200),
  actionType: z.enum(ACTION_TYPES),
  isPlanned: z.boolean().optional(),
  dueDate: optionalDateString,
  status: z.enum(SUBTASK_STATUSES).optional(),
  responsible: optionalString(200),
  notes: optionalString(2000),
  contactId: optionalString(60),
});
export const subtaskUpdateSchema = subtaskInputSchema.partial();

// A contact-centric interaction log entry: same shape as a subtask, but
// created from the contact's side, so the goal link is optional instead
// of coming from the URL.
export const interactionInputSchema = z.object({
  name: z.string().trim().min(1, "Required").max(200),
  actionType: z.enum(ACTION_TYPES),
  isPlanned: z.boolean().optional(),
  dueDate: optionalDateString,
  status: z.enum(SUBTASK_STATUSES).optional(),
  responsible: optionalString(200),
  notes: optionalString(2000),
  goalId: optionalString(60),
});

export const commitmentInputSchema = z.object({
  description: z.string().trim().min(1, "Required").max(2000),
  madeDate: z.string().refine((val) => !Number.isNaN(Date.parse(val)), "Invalid date"),
  followUpDate: optionalDateString,
  status: z.enum(COMMITMENT_STATUSES).optional(),
  notes: optionalString(2000),
  goalId: optionalString(60),
});
export const commitmentUpdateSchema = commitmentInputSchema.partial();

export const contactConnectionInputSchema = z.object({
  otherContactId: z.string().trim().min(1, "Required").max(60),
  description: z.string().trim().min(1, "Required").max(500),
});

export const deadlineInputSchema = z.object({
  title: z.string().trim().min(1, "Required").max(200),
  kind: z.enum(DEADLINE_KINDS),
  description: optionalString(2000),
  dueDate: z.string().refine((val) => !Number.isNaN(Date.parse(val)), "Invalid date"),
  responsible: optionalString(200),
  status: z.enum(DEADLINE_STATUSES).optional(),
  goalId: optionalString(60),
  notes: optionalString(2000),
});
export const deadlineUpdateSchema = deadlineInputSchema.partial();

export const positionInputSchema = z.object({
  title: z.string().trim().min(1, "Required").max(200),
  organization: optionalString(200),
  notes: optionalString(2000),
});
export const positionUpdateSchema = positionInputSchema.partial();

// Assigning a new holder (POST /api/positions/[id]/holders): the server
// closes out whichever holder is currently open, so this only needs the
// incoming holder's own data.
export const positionHolderAssignSchema = z.object({
  contactId: z.string().trim().min(1, "Required").max(60),
  startDate: z.string().refine((val) => !Number.isNaN(Date.parse(val)), "Invalid date"),
  notes: optionalString(2000),
});

// Correcting an existing holder record (dates, notes, even endDate to
// mark a departure with no successor yet) — no auto-close side effects.
export const positionHolderUpdateSchema = z.object({
  startDate: z
    .string()
    .refine((val) => !Number.isNaN(Date.parse(val)), "Invalid date")
    .optional(),
  endDate: optionalDateString,
  notes: optionalString(2000),
});

export const strategicDateInputSchema = z.object({
  title: z.string().trim().min(1, "Required").max(200),
  kind: z.enum(STRATEGIC_DATE_KINDS),
  date: z.string().refine((val) => !Number.isNaN(Date.parse(val)), "Invalid date"),
  description: optionalString(2000),
  isRecurring: z.boolean().optional(),
});
export const strategicDateUpdateSchema = strategicDateInputSchema.partial();

export const spokespersonInputSchema = z.object({
  name: z.string().trim().min(1, "Required").max(200),
  role: optionalString(200),
  topics: optionalString(500),
  email: optionalEmail,
  phone: optionalString(60),
  bio: optionalString(2000),
  mediaTrained: z.boolean().optional(),
  notes: optionalString(2000),
});
export const spokespersonUpdateSchema = spokespersonInputSchema.partial();

export const petitionInputSchema = z.object({
  title: z.string().trim().min(1, "Required").max(200),
  category: optionalString(120),
});
export const petitionUpdateSchema = petitionInputSchema.partial();

// Adding a version never edits a previous one — the wording's evolution
// stays visible instead of being overwritten (POST /api/petitions/[id]/versions).
export const petitionVersionInputSchema = z.object({
  contentEs: z.string().trim().min(1, "Required").max(8000),
  contentEn: optionalString(8000),
  notes: optionalString(2000),
});

export const evidenceInputSchema = z.object({
  title: z.string().trim().min(1, "Required").max(200),
  source: optionalString(200),
  url: optionalString(500),
  summary: optionalString(2000),
  petitionId: optionalString(60),
});
export const evidenceUpdateSchema = evidenceInputSchema.partial();

export const jointLetterInputSchema = z.object({
  title: z.string().trim().min(1, "Required").max(200),
  targetName: optionalString(200),
  sentDate: optionalDateString,
  content: optionalString(8000),
  url: optionalString(500),
  goalId: optionalString(60),
  notes: optionalString(2000),
});
export const jointLetterUpdateSchema = jointLetterInputSchema.partial();

export const jointLetterCosignerInputSchema = z.object({
  organization: z.string().trim().min(1, "Required").max(200),
  contactName: optionalString(200),
  status: z.enum(COSIGNER_STATUSES).optional(),
  notes: optionalString(2000),
});
export const jointLetterCosignerUpdateSchema = jointLetterCosignerInputSchema.partial();

export const mediaCoverageInputSchema = z.object({
  outlet: z.string().trim().min(1, "Required").max(200),
  title: z.string().trim().min(1, "Required").max(300),
  url: optionalString(500),
  publishedDate: z.string().refine((val) => !Number.isNaN(Date.parse(val)), "Invalid date"),
  tone: z.enum(MEDIA_TONES).optional(),
  reach: optionalNonNegativeInt,
  goalId: optionalString(60),
  notes: optionalString(2000),
});
export const mediaCoverageUpdateSchema = mediaCoverageInputSchema.partial();

export const indicatorInputSchema = z.object({
  goalId: optionalString(60),
  name: z.string().trim().min(1, "Required").max(200),
  targetValue: z.coerce.number().finite(),
  currentValue: z.coerce.number().finite().optional(),
  unit: optionalString(40),
  notes: optionalString(2000),
});
export const indicatorUpdateSchema = indicatorInputSchema.partial();
