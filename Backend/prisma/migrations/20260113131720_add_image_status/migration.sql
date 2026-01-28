-- CreateEnum
CREATE TYPE "MediaStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "OfferImage" ADD COLUMN     "status" "MediaStatus" NOT NULL DEFAULT 'PENDING';
