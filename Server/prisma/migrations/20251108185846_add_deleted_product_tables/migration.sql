-- CreateTable
CREATE TABLE "DeletedProduct" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeletedProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeletedProductImage" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "deletedProductId" INTEGER NOT NULL,

    CONSTRAINT "DeletedProductImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DeletedProductImage" ADD CONSTRAINT "DeletedProductImage_deletedProductId_fkey" FOREIGN KEY ("deletedProductId") REFERENCES "DeletedProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
