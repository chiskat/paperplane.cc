/*
  Warnings:

  - You are about to drop the column `traffic_url` on the `wlb_daily_record` table. All the data in the column will be lost.
  - Added the required column `days_to_salary_date` to the `wlb_daily_record` table without a default value. This is not possible if the table is not empty.
  - Added the required column `next_salary_date` to the `wlb_daily_record` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workday` to the `wlb_daily_record` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "wlb_daily_record" DROP COLUMN "traffic_url",
ADD COLUMN     "days_to_salary_date" INTEGER NOT NULL,
ADD COLUMN     "next_salary_date" TEXT NOT NULL,
ADD COLUMN     "stock_delta" DOUBLE PRECISION,
ADD COLUMN     "today_stock" DOUBLE PRECISION,
ADD COLUMN     "workday" BOOLEAN NOT NULL,
ADD COLUMN     "yesterday_stock" DOUBLE PRECISION;
