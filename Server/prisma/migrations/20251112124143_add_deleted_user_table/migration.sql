-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_userId_fkey";

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "status" DROP DEFAULT;

-- CreateTable
CREATE TABLE "DeletedUser" (
    "id" SERIAL NOT NULL,
    "originalId" INTEGER NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "address" TEXT,
    "phoneNumber" TEXT,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeletedUser_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
