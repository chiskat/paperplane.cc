-- DropForeignKey
ALTER TABLE "wlb_daily_record" DROP CONSTRAINT "wlb_daily_record_profile_id_fkey";

-- AddForeignKey
ALTER TABLE "wlb_daily_record" ADD CONSTRAINT "wlb_daily_record_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "wlb_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
