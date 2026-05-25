-- CreateEnum
CREATE TYPE "WLBWeekendOffworkType" AS ENUM ('DEFAULT', 'WORKDAY_SAT', 'WORKDAY_SUN', 'WORKDAY_WEEKEND');

-- CreateEnum
CREATE TYPE "WLBSubscriptionType" AS ENUM ('EMAIL', 'OAROBOT');

-- CreateTable
CREATE TABLE "wlb_profile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stock_code" TEXT,
    "salary_date" INTEGER NOT NULL,
    "offwork_time" INTEGER NOT NULL,
    "weekend_option" "WLBWeekendOffworkType" NOT NULL DEFAULT 'DEFAULT',
    "province" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "latitude" TEXT NOT NULL,
    "longitude" TEXT NOT NULL,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wlb_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wlb_daily_record" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "short_url" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "today_weather" TEXT NOT NULL,
    "today_temperature" TEXT NOT NULL,
    "today_wid" TEXT NOT NULL,
    "tomorrow_weather" TEXT NOT NULL,
    "tomorrow_temperature" TEXT NOT NULL,
    "tomorrow_wid" TEXT NOT NULL,
    "h92" DOUBLE PRECISION NOT NULL,
    "h95" DOUBLE PRECISION NOT NULL,
    "h98" DOUBLE PRECISION NOT NULL,
    "traffic" TEXT NOT NULL,
    "traffic_url" TEXT NOT NULL,
    "traffic_image_url" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wlb_daily_record_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wlb_subscription" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "enable" BOOLEAN NOT NULL DEFAULT true,
    "type" "WLBSubscriptionType" NOT NULL,
    "config" JSONB NOT NULL,
    "time_offset" INTEGER NOT NULL DEFAULT 0,
    "profile_id" TEXT NOT NULL,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wlb_subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wlb_notification_record" (
    "id" TEXT NOT NULL,
    "ok" BOOLEAN NOT NULL DEFAULT true,
    "daily_record_id" TEXT,
    "wlb_subscription_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wlb_notification_record_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "wlb_profile" ADD CONSTRAINT "wlb_profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wlb_daily_record" ADD CONSTRAINT "wlb_daily_record_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "wlb_profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wlb_subscription" ADD CONSTRAINT "wlb_subscription_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "wlb_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wlb_subscription" ADD CONSTRAINT "wlb_subscription_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wlb_notification_record" ADD CONSTRAINT "wlb_notification_record_daily_record_id_fkey" FOREIGN KEY ("daily_record_id") REFERENCES "wlb_daily_record"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wlb_notification_record" ADD CONSTRAINT "wlb_notification_record_wlb_subscription_id_fkey" FOREIGN KEY ("wlb_subscription_id") REFERENCES "wlb_subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
