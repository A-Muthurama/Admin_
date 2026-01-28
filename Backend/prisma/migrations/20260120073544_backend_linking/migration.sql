/*
  Warnings:

  - A unique constraint covering the columns `[externalVendorId]` on the table `Offer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[externalVendorId]` on the table `VendorProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Offer" ADD COLUMN     "externalVendorId" INTEGER;

-- AlterTable
ALTER TABLE "VendorProfile" ADD COLUMN     "externalVendorId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Offer_externalVendorId_key" ON "Offer"("externalVendorId");

-- CreateIndex
CREATE UNIQUE INDEX "VendorProfile_externalVendorId_key" ON "VendorProfile"("externalVendorId");
