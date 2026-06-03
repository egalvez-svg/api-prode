-- AlterTable
ALTER TABLE "InviteCode" ADD COLUMN     "accesoEliminatoria" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "accesoGrupos" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accesoEliminatoria" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "accesoGrupos" BOOLEAN NOT NULL DEFAULT false;
