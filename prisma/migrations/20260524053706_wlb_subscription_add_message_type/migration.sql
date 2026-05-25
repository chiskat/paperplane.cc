-- CreateEnum
CREATE TYPE "WLBSubscriptionMessage" AS ENUM ('IMAGE', 'TEXT', 'ALL');

-- AlterTable
ALTER TABLE "wlb_subscription" ADD COLUMN     "message" "WLBSubscriptionMessage" NOT NULL DEFAULT 'IMAGE';
