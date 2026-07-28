import { z } from "zod";
import {
  GOAL_KINDS,
  GOAL_STATUSES,
  CONTACT_RELATIONS,
  ACTION_TYPES,
  SUBTASK_STATUSES,
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

export const goalInputSchema = z.object({
  name: z.string().trim().min(1, "Required").max(200),
  kind: z.enum(GOAL_KINDS),
  responsible: z.string().trim().min(1, "Required").max(200),
  category: optionalString(120),
  description: optionalString(4000),
  targetDate: optionalDateString,
  status: z.enum(GOAL_STATUSES).optional(),
});
export const goalUpdateSchema = goalInputSchema.partial();

export const contactInputSchema = z.object({
  name: z.string().trim().min(1, "Required").max(200),
  organization: optionalString(200),
  role: optionalString(200),
  relation: z.enum(CONTACT_RELATIONS),
  email: optionalString(200),
  phone: optionalString(60),
  notes: optionalString(2000),
});
export const contactUpdateSchema = contactInputSchema.partial();

export const subtaskInputSchema = z.object({
  name: z.string().trim().min(1, "Required").max(200),
  actionType: z.enum(ACTION_TYPES),
  isPlanned: z.boolean().optional(),
  dueDate: optionalDateString,
  status: z.enum(SUBTASK_STATUSES).optional(),
  responsible: optionalString(200),
  notes: optionalString(2000),
});
export const subtaskUpdateSchema = subtaskInputSchema.partial();

export const indicatorInputSchema = z.object({
  goalId: optionalString(60),
  name: z.string().trim().min(1, "Required").max(200),
  targetValue: z.coerce.number().finite(),
  currentValue: z.coerce.number().finite().optional(),
  unit: optionalString(40),
  notes: optionalString(2000),
});
export const indicatorUpdateSchema = indicatorInputSchema.partial();
