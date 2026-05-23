-- Sync schema: add missing columns and tables not included in original migrations

-- UserAdmin: add email and role columns
ALTER TABLE "UserAdmin" ADD COLUMN "email" TEXT NOT NULL DEFAULT '';
ALTER TABLE "UserAdmin" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'ADMIN';
CREATE UNIQUE INDEX "UserAdmin_email_key" ON "UserAdmin"("email");

-- User table (completely missing from migrations)
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'PARTNER',
    "status" TEXT NOT NULL DEFAULT 'PENDING_APPROVAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- StorePartner table (completely missing from migrations)
CREATE TABLE "StorePartner" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "businessName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "StorePartner_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "StorePartner_userId_key" ON "StorePartner"("userId");
ALTER TABLE "StorePartner" ADD CONSTRAINT "StorePartner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Stores: add missing columns
ALTER TABLE "Stores" ADD COLUMN "slug" TEXT;
ALTER TABLE "Stores" ADD COLUMN "ha" TEXT;
ALTER TABLE "Stores" ADD COLUMN "hc" TEXT;
ALTER TABLE "Stores" ADD COLUMN "partnerId" INTEGER;
CREATE UNIQUE INDEX "Stores_slug_key" ON "Stores"("slug");
ALTER TABLE "Stores" ADD CONSTRAINT "Stores_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "StorePartner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Product: add missing slug column
ALTER TABLE "Product" ADD COLUMN "slug" TEXT;
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- Fix FK cascade for ProductsCategories.storeId (RESTRICT → CASCADE)
ALTER TABLE "ProductsCategories" DROP CONSTRAINT "ProductsCategories_storeId_fkey";
ALTER TABLE "ProductsCategories" ADD CONSTRAINT "ProductsCategories_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Fix FK cascade for Product.storeId and Product.categoryId (RESTRICT → CASCADE)
ALTER TABLE "Product" DROP CONSTRAINT "Product_storeId_fkey";
ALTER TABLE "Product" ADD CONSTRAINT "Product_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Product" DROP CONSTRAINT "Product_categoryId_fkey";
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ProductsCategories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
