/*
  Warnings:

  - You are about to drop the `DeliveryOptions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DeliveryOptions" DROP CONSTRAINT "DeliveryOptions_storeId_fkey";

-- AlterTable
ALTER TABLE "UserAdmin" ALTER COLUMN "email" DROP DEFAULT;

-- DropTable
DROP TABLE "DeliveryOptions";

-- CreateTable
CREATE TABLE "DeliverySettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "pricePerKm" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliverySettings_pkey" PRIMARY KEY ("id")
);
