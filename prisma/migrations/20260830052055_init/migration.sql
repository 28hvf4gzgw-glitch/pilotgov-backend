-- CreateTable
CREATE TABLE "needs" (
    "id" TEXT NOT NULL,
    "dept" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "budget" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "postedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'Open',

    CONSTRAINT "needs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pilot_cards" (
    "id" TEXT NOT NULL,
    "startup" TEXT NOT NULL,
    "dept" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "budget" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "date" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Applied',
    "accent" TEXT NOT NULL DEFAULT 'text-sky-400',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pilot_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scaled_contracts" (
    "id" TEXT NOT NULL,
    "startup" TEXT NOT NULL,
    "dept" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "pilotBudget" TEXT NOT NULL,
    "scaledBudget" TEXT NOT NULL,
    "pilotStartDate" TEXT NOT NULL,
    "contractDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scaled_contracts_pkey" PRIMARY KEY ("id")
);
