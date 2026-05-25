-- DropForeignKey
ALTER TABLE "wlb_notification_record" DROP CONSTRAINT "wlb_notification_record_daily_record_id_fkey";

-- AddForeignKey
ALTER TABLE "wlb_notification_record" ADD CONSTRAINT "wlb_notification_record_daily_record_id_fkey" FOREIGN KEY ("daily_record_id") REFERENCES "wlb_daily_record"("id") ON DELETE CASCADE ON UPDATE CASCADE;
