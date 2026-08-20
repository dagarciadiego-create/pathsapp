-- Adds workshop team ownership to every directly-created record.
--
-- The column is NOT NULL with no default in the Prisma schema, so the
-- application must always state which team it is writing for. Here it is
-- added WITH a temporary default purely so pre-existing rows have
-- somewhere to go (they become EQUIPO1's data), and the default is then
-- dropped so no future insert can silently land in the wrong team.

-- AlterTable
ALTER TABLE "AdvocacyGoal" ADD COLUMN "team" TEXT NOT NULL DEFAULT 'EQUIPO1';
ALTER TABLE "AdvocacyGoal" ALTER COLUMN "team" DROP DEFAULT;
ALTER TABLE "Contact" ADD COLUMN "team" TEXT NOT NULL DEFAULT 'EQUIPO1';
ALTER TABLE "Contact" ALTER COLUMN "team" DROP DEFAULT;
ALTER TABLE "Deadline" ADD COLUMN "team" TEXT NOT NULL DEFAULT 'EQUIPO1';
ALTER TABLE "Deadline" ALTER COLUMN "team" DROP DEFAULT;
ALTER TABLE "Evidence" ADD COLUMN "team" TEXT NOT NULL DEFAULT 'EQUIPO1';
ALTER TABLE "Evidence" ALTER COLUMN "team" DROP DEFAULT;
ALTER TABLE "Indicator" ADD COLUMN "team" TEXT NOT NULL DEFAULT 'EQUIPO1';
ALTER TABLE "Indicator" ALTER COLUMN "team" DROP DEFAULT;
ALTER TABLE "JointLetter" ADD COLUMN "team" TEXT NOT NULL DEFAULT 'EQUIPO1';
ALTER TABLE "JointLetter" ALTER COLUMN "team" DROP DEFAULT;
ALTER TABLE "MediaCoverage" ADD COLUMN "team" TEXT NOT NULL DEFAULT 'EQUIPO1';
ALTER TABLE "MediaCoverage" ALTER COLUMN "team" DROP DEFAULT;
ALTER TABLE "Petition" ADD COLUMN "team" TEXT NOT NULL DEFAULT 'EQUIPO1';
ALTER TABLE "Petition" ALTER COLUMN "team" DROP DEFAULT;
ALTER TABLE "Position" ADD COLUMN "team" TEXT NOT NULL DEFAULT 'EQUIPO1';
ALTER TABLE "Position" ALTER COLUMN "team" DROP DEFAULT;
ALTER TABLE "Spokesperson" ADD COLUMN "team" TEXT NOT NULL DEFAULT 'EQUIPO1';
ALTER TABLE "Spokesperson" ALTER COLUMN "team" DROP DEFAULT;
ALTER TABLE "StrategicDate" ADD COLUMN "team" TEXT NOT NULL DEFAULT 'EQUIPO1';
ALTER TABLE "StrategicDate" ALTER COLUMN "team" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "AdvocacyGoal_team_idx" ON "AdvocacyGoal"("team");
CREATE INDEX "Contact_team_idx" ON "Contact"("team");
CREATE INDEX "Deadline_team_idx" ON "Deadline"("team");
CREATE INDEX "Evidence_team_idx" ON "Evidence"("team");
CREATE INDEX "Indicator_team_idx" ON "Indicator"("team");
CREATE INDEX "JointLetter_team_idx" ON "JointLetter"("team");
CREATE INDEX "MediaCoverage_team_idx" ON "MediaCoverage"("team");
CREATE INDEX "Petition_team_idx" ON "Petition"("team");
CREATE INDEX "Position_team_idx" ON "Position"("team");
CREATE INDEX "Spokesperson_team_idx" ON "Spokesperson"("team");
CREATE INDEX "StrategicDate_team_idx" ON "StrategicDate"("team");
