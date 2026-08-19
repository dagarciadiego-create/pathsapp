// The workshop challenge set, used by the /workshop page. Only ids and
// level grouping live here — every user-facing string comes from the
// Workshop.challenges.<id> namespace in messages/*.json, so the whole
// thing stays bilingual like the rest of the app.
export const WORKSHOP_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;
export type WorkshopLevel = (typeof WORKSHOP_LEVELS)[number];

export const WORKSHOP_CHALLENGES: Record<WorkshopLevel, string[]> = {
  BEGINNER: ["b1", "b2", "b3", "b4", "b5"],
  INTERMEDIATE: ["i1", "i2", "i3", "i4", "i5"],
  ADVANCED: ["a1", "a2", "a3", "a4", "a5"],
};

export const WORKSHOP_CHALLENGE_IDS = WORKSHOP_LEVELS.flatMap(
  (level) => WORKSHOP_CHALLENGES[level]
);

// Participants tick challenges off on their own device; there's no account
// system, so progress is per-browser rather than per-user by design.
export const WORKSHOP_STORAGE_KEY = "pathsapp.workshop.done";

// Challenges are numbered 1-15 straight through all three levels, so a
// participant can say "I'm stuck on 11" without naming their level.
export const WORKSHOP_CHALLENGE_NUMBER: Record<string, number> = Object.fromEntries(
  WORKSHOP_CHALLENGE_IDS.map((id, index) => [id, index + 1])
);
