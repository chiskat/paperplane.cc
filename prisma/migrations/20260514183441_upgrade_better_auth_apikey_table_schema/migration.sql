-- AlterTable
ALTER TABLE "apikey" ADD COLUMN     "config_id" TEXT NOT NULL DEFAULT 'default',
ADD COLUMN     "reference_id" TEXT;

-- CreateIndex
CREATE INDEX "apikey_config_id_idx" ON "apikey"("config_id");

-- CreateIndex
CREATE INDEX "apikey_reference_id_idx" ON "apikey"("reference_id");
