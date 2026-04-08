-- CreateTable
CREATE TABLE "public"."user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL,
    "image" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."session" (
    "id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."account" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "id_token" TEXT,
    "access_token_expires_at" TIMESTAMP(3),
    "refresh_token_expires_at" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."awesome_catelog" (
    "id" TEXT NOT NULL,
    "index" INTEGER DEFAULT 0,
    "name" TEXT NOT NULL,
    "desc" TEXT,
    "parent_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "awesome_catelog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."awesome_tag" (
    "id" TEXT NOT NULL,
    "index" INTEGER DEFAULT 0,
    "label" TEXT NOT NULL,
    "desc" TEXT,
    "color" TEXT,
    "icon" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "awesome_tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."awesome_item" (
    "id" TEXT NOT NULL,
    "index" INTEGER DEFAULT 0,
    "label" TEXT NOT NULL,
    "homepage" TEXT NOT NULL,
    "source" TEXT,
    "registry" TEXT,
    "desc" TEXT,
    "stars" INTEGER DEFAULT 0,
    "catelog_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "awesome_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_awesome_item_to_awesome_tag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_awesome_item_to_awesome_tag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "public"."user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "public"."session"("token");

-- CreateIndex
CREATE INDEX "_awesome_item_to_awesome_tag_B_index" ON "public"."_awesome_item_to_awesome_tag"("B");

-- AddForeignKey
ALTER TABLE "public"."session" ADD CONSTRAINT "session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."account" ADD CONSTRAINT "account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."awesome_catelog" ADD CONSTRAINT "awesome_catelog_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."awesome_catelog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."awesome_item" ADD CONSTRAINT "awesome_item_catelog_id_fkey" FOREIGN KEY ("catelog_id") REFERENCES "public"."awesome_catelog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_awesome_item_to_awesome_tag" ADD CONSTRAINT "_awesome_item_to_awesome_tag_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."awesome_item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_awesome_item_to_awesome_tag" ADD CONSTRAINT "_awesome_item_to_awesome_tag_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."awesome_tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
