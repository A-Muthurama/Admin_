/*
  Warnings:

  - You are about to drop the column `externalVendorId` on the `Offer` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[externalOfferId]` on the table `Offer` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Offer_externalVendorId_key";

-- AlterTable
ALTER TABLE "Offer" DROP COLUMN "externalVendorId",
ADD COLUMN     "externalOfferId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Offer_externalOfferId_key" ON "Offer"("externalOfferId");
