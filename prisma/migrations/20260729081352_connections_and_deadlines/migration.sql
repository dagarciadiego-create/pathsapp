-- CreateTable
CREATE TABLE "ContactConnection" (
    "id" TEXT NOT NULL,
    "contactAId" TEXT NOT NULL,
    "contactBId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deadline" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "responsible" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "goalId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deadline_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContactConnection_contactAId_idx" ON "ContactConnection"("contactAId");

-- CreateIndex
CREATE INDEX "ContactConnection_contactBId_idx" ON "ContactConnection"("contactBId");

-- CreateIndex
CREATE INDEX "Deadline_goalId_idx" ON "Deadline"("goalId");

-- AddForeignKey
ALTER TABLE "ContactConnection" ADD CONSTRAINT "ContactConnection_contactAId_fkey" FOREIGN KEY ("contactAId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactConnection" ADD CONSTRAINT "ContactConnection_contactBId_fkey" FOREIGN KEY ("contactBId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deadline" ADD CONSTRAINT "Deadline_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "AdvocacyGoal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
