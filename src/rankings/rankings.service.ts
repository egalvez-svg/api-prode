import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RankingsService {
  constructor(private prisma: PrismaService) {}

  async getLeaderboard() {
    const users = await this.prisma.user.findMany({
      where: { roles: { has: 'USER' }, activo: true },
      select: {
        id: true,
        name: true,
        email: true,
        bets: { select: { points: true, basePoints: true } },
      },
    });

    const ranking = users
      .map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        totalPoints: user.bets.reduce((sum, b) => sum + b.points, 0),
        totalBets: user.bets.length,
        exactScores: user.bets.filter((b) => b.basePoints === 3).length,
        correctResults: user.bets.filter((b) => b.basePoints === 1).length,
      }))
      .sort((a, b) => {
        if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
        return b.exactScores - a.exactScores;
      })
      .map((entry, index) => ({ position: index + 1, ...entry }));

    return ranking;
  }

  async getUserPosition(userId: number) {
    const leaderboard = await this.getLeaderboard();
    const entry = leaderboard.find((e) => e.id === userId);
    return entry ?? null;
  }
}
