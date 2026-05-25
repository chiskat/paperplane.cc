/*
  Warnings:

  - Added the required column `company` to the `wlb_profile` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SalaryDayType" AS ENUM ('EARLY_TO_WORKDAY', 'LATER_TO_WORKDAY', 'ANYDAY');

-- AlterTable
ALTER TABLE "wlb_profile" ADD COLUMN     "company" TEXT NOT NULL,
ADD COLUMN     "salary_day_option" "SalaryDayType" NOT NULL DEFAULT 'EARLY_TO_WORKDAY';
