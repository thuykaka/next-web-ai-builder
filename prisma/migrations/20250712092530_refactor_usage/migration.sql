/*
  Warnings:

  - The primary key for the `Usage` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `Usage` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `Usage` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Usage` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Usage` table. All the data in the column will be lost.
  - Added the required column `key` to the `Usage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Usage" DROP CONSTRAINT "Usage_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "expiresAt",
DROP COLUMN "id",
DROP COLUMN "updatedAt",
ADD COLUMN     "expire" TIMESTAMP(3),
ADD COLUMN     "key" TEXT NOT NULL,
ADD CONSTRAINT "Usage_pkey" PRIMARY KEY ("key");
