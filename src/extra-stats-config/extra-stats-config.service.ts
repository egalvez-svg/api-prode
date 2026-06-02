import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertExtraStatsConfigDto } from './dto/upsert-extra-stats-config.dto';

@Injectable()
export class ExtraStatsConfigService {
  constructor(private prisma: PrismaService) {}

  async upsertStage(stage: string, dto: UpsertExtraStatsConfigDto) {
    const goalPoints = dto.goalPoints ?? 1;
    const cardPoints = dto.cardPoints ?? 1;
    return this.prisma.stageExtraConfig.upsert({
      where: { stage },
      update: { trackGoals: dto.trackGoals, trackCards: dto.trackCards, goalPoints, cardPoints },
      create: { stage, trackGoals: dto.trackGoals, trackCards: dto.trackCards, goalPoints, cardPoints },
    });
  }

  async upsertMatch(matchId: number, dto: UpsertExtraStatsConfigDto) {
    const match = await this.prisma.match.findUnique({ where: { id: matchId } });
    if (!match) throw new NotFoundException('Partido no encontrado');

    const goalPoints = dto.goalPoints ?? 1;
    const cardPoints = dto.cardPoints ?? 1;
    return this.prisma.matchExtraConfig.upsert({
      where: { matchId },
      update: { trackGoals: dto.trackGoals, trackCards: dto.trackCards, goalPoints, cardPoints },
      create: { matchId, trackGoals: dto.trackGoals, trackCards: dto.trackCards, goalPoints, cardPoints },
    });
  }

  async findAllStage() {
    return this.prisma.stageExtraConfig.findMany({ orderBy: { stage: 'asc' } });
  }

  async findAllMatch() {
    return this.prisma.matchExtraConfig.findMany({
      orderBy: { matchId: 'asc' },
      include: { match: { select: { homeTeam: true, awayTeam: true, matchDate: true } } },
    });
  }

  async deleteStage(stage: string) {
    const existing = await this.prisma.stageExtraConfig.findUnique({ where: { stage } });
    if (!existing) throw new NotFoundException('Configuración de etapa no encontrada');
    return this.prisma.stageExtraConfig.delete({ where: { stage } });
  }

  async deleteMatch(matchId: number) {
    const existing = await this.prisma.matchExtraConfig.findUnique({ where: { matchId } });
    if (!existing) throw new NotFoundException('Configuración de partido no encontrada');
    return this.prisma.matchExtraConfig.delete({ where: { matchId } });
  }

  async getExtraConfigForMatch(
    matchId: number,
    stage: string | null,
  ): Promise<{ trackGoals: boolean; trackCards: boolean; goalPoints: number; cardPoints: number }> {
    const matchConfig = await this.prisma.matchExtraConfig.findUnique({ where: { matchId } });
    if (matchConfig) {
      return {
        trackGoals: matchConfig.trackGoals,
        trackCards: matchConfig.trackCards,
        goalPoints: matchConfig.goalPoints,
        cardPoints: matchConfig.cardPoints,
      };
    }

    if (stage) {
      const stageConfig = await this.prisma.stageExtraConfig.findUnique({ where: { stage } });
      if (stageConfig) {
        return {
          trackGoals: stageConfig.trackGoals,
          trackCards: stageConfig.trackCards,
          goalPoints: stageConfig.goalPoints,
          cardPoints: stageConfig.cardPoints,
        };
      }
    }

    return { trackGoals: false, trackCards: false, goalPoints: 1, cardPoints: 1 };
  }
}
