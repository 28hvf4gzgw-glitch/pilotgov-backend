-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "scaledContractId" TEXT NOT NULL,
    "citizenId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reviews_scaledContractId_citizenId_key" ON "reviews"("scaledContractId", "citizenId");

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_scaledContractId_fkey" FOREIGN KEY ("scaledContractId") REFERENCES "scaled_contracts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
