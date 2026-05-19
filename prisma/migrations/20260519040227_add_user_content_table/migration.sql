-- CreateTable
CREATE TABLE "user_content" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "upload_url" TEXT NOT NULL,
    "ready" BOOLEAN NOT NULL DEFAULT false,
    "expired_at" TIMESTAMP(3),
    "usage" TEXT NOT NULL,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_content_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user_content" ADD CONSTRAINT "user_content_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
