-- AlterTable
ALTER TABLE "GoalContact" ADD COLUMN     "stance" TEXT;

-- AlterTable
ALTER TABLE "Subtask" ADD COLUMN     "contactId" TEXT,
ALTER COLUMN "goalId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "StanceChange" (
    "id" TEXT NOT NULL,
    "goalContactId" TEXT NOT NULL,
    "stance" TEXT NOT NULL,
    "note" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StanceChange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Commitment" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "goalId" TEXT,
    "description" TEXT NOT NULL,
    "madeDate" TIMESTAMP(3) NOT NULL,
    "followUpDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Commitment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StanceChange_goalContactId_idx" ON "StanceChange"("goalContactId");

-- CreateIndex
CREATE INDEX "Commitment_contactId_idx" ON "Commitment"("contactId");

-- CreateIndex
CREATE INDEX "Commitment_goalId_idx" ON "Commitment"("goalId");

-- CreateIndex
CREATE INDEX "Subtask_contactId_idx" ON "Subtask"("contactId");

-- AddForeignKey
ALTER TABLE "StanceChange" ADD CONSTRAINT "StanceChange_goalContactId_fkey" FOREIGN KEY ("goalContactId") REFERENCES "GoalContact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subtask" ADD CONSTRAINT "Subtask_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commitment" ADD CONSTRAINT "Commitment_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commitment" ADD CONSTRAINT "Commitment_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "AdvocacyGoal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
