-- CreateEnum
CREATE TYPE "PrizeFase" AS ENUM ('GRUPOS', 'ELIMINATORIA');

-- AlterTable
ALTER TABLE "Prize" ADD COLUMN "fase" "PrizeFase";
UPDATE "Prize" SET "fase" = 'GRUPOS' WHERE "fase" IS NULL;
ALTER TABLE "Prize" ALTER COLUMN "fase" SET NOT NULL;
