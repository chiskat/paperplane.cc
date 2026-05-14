/*
  Warnings:

  - You are about to drop the column `user_id` on the `apikey` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "apikey" DROP CONSTRAINT "apikey_user_id_fkey";

-- DropIndex
DROP INDEX "apikey_user_id_idx";

-- AlterTable
ALTER TABLE "apikey" DROP COLUMN "user_id";
