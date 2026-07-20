-- CreateEnum
CREATE TYPE "NotificationKind" AS ENUM ('order', 'preorder', 'payment');

-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'To''lov tekshirilmoqda';

-- AlterTable (cast existing values instead of dropping — NotificationKind is
-- a superset of the old OrderKind values, so nothing is lost)
ALTER TABLE "notifications" ALTER COLUMN "kind" TYPE "NotificationKind" USING ("kind"::text::"NotificationKind");
