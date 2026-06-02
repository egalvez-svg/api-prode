-- CreateEnum
CREATE TYPE "GoalTeamSide" AS ENUM ('home', 'away');

-- AlterTable
ALTER TABLE "Bet" ADD COLUMN     "redAwayPick" INTEGER,
ADD COLUMN     "redHomePick" INTEGER,
ADD COLUMN     "yellowAwayPick" INTEGER,
ADD COLUMN     "yellowHomePick" INTEGER;

-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "redAway" INTEGER,
ADD COLUMN     "redHome" INTEGER,
ADD COLUMN     "yellowAway" INTEGER,
ADD COLUMN     "yellowHome" INTEGER;

-- CreateTable
CREATE TABLE "GoalEvent" (
    "id" SERIAL NOT NULL,
    "matchId" INTEGER NOT NULL,
    "player" TEXT NOT NULL,
    "team" "GoalTeamSide" NOT NULL,

    CONSTRAINT "GoalEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoalScorerPick" (
    "id" SERIAL NOT NULL,
    "betId" INTEGER NOT NULL,
    "player" TEXT NOT NULL,

    CONSTRAINT "GoalScorerPick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StageExtraConfig" (
    "id" SERIAL NOT NULL,
    "stage" TEXT NOT NULL,
    "trackGoals" BOOLEAN NOT NULL DEFAULT false,
    "trackCards" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "StageExtraConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchExtraConfig" (
    "id" SERIAL NOT NULL,
    "matchId" INTEGER NOT NULL,
    "trackGoals" BOOLEAN NOT NULL DEFAULT false,
    "trackCards" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MatchExtraConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StageExtraConfig_stage_key" ON "StageExtraConfig"("stage");

-- CreateIndex
CREATE UNIQUE INDEX "MatchExtraConfig_matchId_key" ON "MatchExtraConfig"("matchId");

-- AddForeignKey
ALTER TABLE "GoalEvent" ADD CONSTRAINT "GoalEvent_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoalScorerPick" ADD CONSTRAINT "GoalScorerPick_betId_fkey" FOREIGN KEY ("betId") REFERENCES "Bet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchExtraConfig" ADD CONSTRAINT "MatchExtraConfig_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
