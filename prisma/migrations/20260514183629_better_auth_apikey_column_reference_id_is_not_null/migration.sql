/*
  Warnings:

  - Made the column `reference_id` on table `apikey` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "apikey" ALTER COLUMN "reference_id" SET NOT NULL;
