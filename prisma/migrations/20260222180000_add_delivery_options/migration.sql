-- CreateTable
CREATE TABLE "DeliveryOptions" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "fee" DOUBLE PRECISION NOT NULL,
    "storeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- AddForeignKey
ALTER TABLE "DeliveryOptions" ADD CONSTRAINT "DeliveryOptions_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
