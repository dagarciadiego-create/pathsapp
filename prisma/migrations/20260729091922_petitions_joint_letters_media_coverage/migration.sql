-- CreateTable
CREATE TABLE "Petition" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Petition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PetitionVersion" (
    "id" TEXT NOT NULL,
    "petitionId" TEXT NOT NULL,
    "contentEs" TEXT NOT NULL,
    "contentEn" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PetitionVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evidence" (
    "id" TEXT NOT NULL,
    "petitionId" TEXT,
    "title" TEXT NOT NULL,
    "source" TEXT,
    "url" TEXT,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JointLetter" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "targetName" TEXT,
    "sentDate" TIMESTAMP(3),
    "content" TEXT,
    "url" TEXT,
    "goalId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JointLetter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JointLetterCosigner" (
    "id" TEXT NOT NULL,
    "jointLetterId" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "contactName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'INVITED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JointLetterCosigner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaCoverage" (
    "id" TEXT NOT NULL,
    "outlet" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT,
    "publishedDate" TIMESTAMP(3) NOT NULL,
    "tone" TEXT NOT NULL DEFAULT 'NEUTRAL',
    "reach" INTEGER,
    "goalId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaCoverage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PetitionVersion_petitionId_idx" ON "PetitionVersion"("petitionId");

-- CreateIndex
CREATE INDEX "Evidence_petitionId_idx" ON "Evidence"("petitionId");

-- CreateIndex
CREATE INDEX "JointLetter_goalId_idx" ON "JointLetter"("goalId");

-- CreateIndex
CREATE INDEX "JointLetterCosigner_jointLetterId_idx" ON "JointLetterCosigner"("jointLetterId");

-- CreateIndex
CREATE INDEX "MediaCoverage_goalId_idx" ON "MediaCoverage"("goalId");

-- AddForeignKey
ALTER TABLE "PetitionVersion" ADD CONSTRAINT "PetitionVersion_petitionId_fkey" FOREIGN KEY ("petitionId") REFERENCES "Petition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_petitionId_fkey" FOREIGN KEY ("petitionId") REFERENCES "Petition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JointLetter" ADD CONSTRAINT "JointLetter_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "AdvocacyGoal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JointLetterCosigner" ADD CONSTRAINT "JointLetterCosigner_jointLetterId_fkey" FOREIGN KEY ("jointLetterId") REFERENCES "JointLetter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaCoverage" ADD CONSTRAINT "MediaCoverage_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "AdvocacyGoal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
