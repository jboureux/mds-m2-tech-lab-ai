/*
  Warnings:

  - The values [PENDING,REMOVED] on the enum `PostStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PostStatus_new" AS ENUM ('PUBLISHED', 'FLAGGED', 'HIDDEN');
ALTER TABLE "public"."post" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "post" ALTER COLUMN "status" TYPE "PostStatus_new" USING ("status"::text::"PostStatus_new");
ALTER TYPE "PostStatus" RENAME TO "PostStatus_old";
ALTER TYPE "PostStatus_new" RENAME TO "PostStatus";
DROP TYPE "public"."PostStatus_old";
ALTER TABLE "post" ALTER COLUMN "status" SET DEFAULT 'PUBLISHED';
COMMIT;

-- AlterTable
ALTER TABLE "post" ALTER COLUMN "status" SET DEFAULT 'PUBLISHED';
