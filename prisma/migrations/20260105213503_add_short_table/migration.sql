-- CreateEnum
CREATE TYPE "ShortRedirectType" AS ENUM ('PERMANENTLY', 'TEMPORARY', 'JAVASCRIPT');

-- CreateTable
CREATE TABLE "short_item" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "tag" TEXT,
    "redirect_type" "ShortRedirectType" NOT NULL DEFAULT 'PERMANENTLY',
    "expired_at" TIMESTAMP(3),
    "public" BOOLEAN NOT NULL DEFAULT false,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "short_item_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "short_item" ADD CONSTRAINT "short_item_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
