-- CreateEnum
CREATE TYPE "OARobotType" AS ENUM ('DINGTALK', 'WXBIZ', 'FEISHU');

-- CreateTable
CREATE TABLE "oa_robot_profile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "desc" TEXT,
    "type" "OARobotType" NOT NULL,
    "access_token" TEXT,
    "secret" TEXT,
    "extra_authentication" JSONB,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "oa_robot_profile_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "oa_robot_profile" ADD CONSTRAINT "oa_robot_profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
