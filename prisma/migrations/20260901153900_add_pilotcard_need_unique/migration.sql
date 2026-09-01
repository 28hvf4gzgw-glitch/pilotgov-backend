-- AlterTable
ALTER TABLE "pilot_cards" ADD COLUMN     "needId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "pilot_cards_startup_needId_key" ON "pilot_cards"("startup", "needId");
