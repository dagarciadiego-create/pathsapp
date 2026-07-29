-- CreateTable
CREATE TABLE "Position" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "organization" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PositionHolder" (
    "id" TEXT NOT NULL,
    "positionId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PositionHolder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StrategicDate" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StrategicDate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Spokesperson" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "topics" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "bio" TEXT,
    "mediaTrained" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Spokesperson_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PositionHolder_positionId_idx" ON "PositionHolder"("positionId");

-- CreateIndex
CREATE INDEX "PositionHolder_contactId_idx" ON "PositionHolder"("contactId");

-- AddForeignKey
ALTER TABLE "PositionHolder" ADD CONSTRAINT "PositionHolder_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PositionHolder" ADD CONSTRAINT "PositionHolder_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;
