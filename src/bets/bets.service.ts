import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MatchStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ExtraStatsConfigService } from '../extra-stats-config/extra-stats-config.service';
import { CreateBetDto } from './dto/create-bet.dto';

@Injectable()
export class BetsService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private extraStatsConfig: ExtraStatsConfigService,
  ) {}

  async create(userId: number, dto: CreateBetDto) {
    const match = await this.prisma.match.findUnique({ where: { id: dto.matchId } });
    if (!match) throw new NotFoundException('Partido no encontrado');

    if (match.status !== MatchStatus.SCHEDULED) {
      throw new BadRequestException('Solo se puede apostar en partidos programados');
    }

    const deadlineMinutes = this.config.get<number>('BET_DEADLINE_MINUTES', 30);
    const deadline = new Date(match.matchDate.getTime() - deadlineMinutes * 60 * 1000);
    if (new Date() > deadline) {
      throw new BadRequestException(
        `Las apuestas cierran ${deadlineMinutes} minutos antes del partido`,
      );
    }

    const config = await this.extraStatsConfig.getExtraConfigForMatch(match.id, match.stage);

    if (!config.trackGoals && dto.goalScorerPicks && dto.goalScorerPicks.length > 0) {
      throw new BadRequestException('Este partido no tiene apuestas de goleadores habilitadas');
    }

    const hasCardPick =
      dto.yellowHomePick !== undefined ||
      dto.yellowAwayPick !== undefined ||
      dto.redHomePick !== undefined ||
      dto.redAwayPick !== undefined;

    if (!config.trackCards && hasCardPick) {
      throw new BadRequestException('Este partido no tiene apuestas de tarjetas habilitadas');
    }

    const existing = await this.prisma.bet.findUnique({
      where: { userId_matchId: { userId, matchId: dto.matchId } },
      include: { goalScorerPicks: true },
    });

    if (existing) {
      return this.prisma.$transaction(async (tx) => {
        if (config.trackGoals && dto.goalScorerPicks !== undefined) {
          await tx.goalScorerPick.deleteMany({ where: { betId: existing.id } });
          if (dto.goalScorerPicks.length > 0) {
            await tx.goalScorerPick.createMany({
              data: dto.goalScorerPicks.map((player) => ({ betId: existing.id, player })),
            });
          }
        }

        return tx.bet.update({
          where: { id: existing.id },
          data: {
            homeScore: dto.homeScore,
            awayScore: dto.awayScore,
            yellowHomePick: config.trackCards ? dto.yellowHomePick ?? null : undefined,
            yellowAwayPick: config.trackCards ? dto.yellowAwayPick ?? null : undefined,
            redHomePick: config.trackCards ? dto.redHomePick ?? null : undefined,
            redAwayPick: config.trackCards ? dto.redAwayPick ?? null : undefined,
          },
          include: { match: true, goalScorerPicks: true },
        });
      });
    }

    return this.prisma.$transaction(async (tx) => {
      const bet = await tx.bet.create({
        data: {
          userId,
          matchId: dto.matchId,
          homeScore: dto.homeScore,
          awayScore: dto.awayScore,
          yellowHomePick: config.trackCards ? dto.yellowHomePick ?? null : null,
          yellowAwayPick: config.trackCards ? dto.yellowAwayPick ?? null : null,
          redHomePick: config.trackCards ? dto.redHomePick ?? null : null,
          redAwayPick: config.trackCards ? dto.redAwayPick ?? null : null,
        },
        include: { match: true },
      });

      if (config.trackGoals && dto.goalScorerPicks && dto.goalScorerPicks.length > 0) {
        await tx.goalScorerPick.createMany({
          data: dto.goalScorerPicks.map((player) => ({ betId: bet.id, player })),
        });
      }

      return tx.bet.findUnique({
        where: { id: bet.id },
        include: { match: true, goalScorerPicks: true },
      });
    });
  }

  async findMyBets(userId: number) {
    return this.prisma.bet.findMany({
      where: { userId },
      include: { match: true, goalScorerPicks: true },
      orderBy: { match: { matchDate: 'asc' } },
    });
  }

  async findOne(id: number, userId: number, isAdmin: boolean) {
    const bet = await this.prisma.bet.findUnique({
      where: { id },
      include: {
        match: true,
        goalScorerPicks: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });
    if (!bet) throw new NotFoundException('Apuesta no encontrada');
    if (!isAdmin && bet.userId !== userId) throw new ForbiddenException();
    return bet;
  }

  async delete(id: number, userId: number, isAdmin: boolean) {
    const bet = await this.prisma.bet.findUnique({
      where: { id },
      include: { match: true },
    });
    if (!bet) throw new NotFoundException('Apuesta no encontrada');
    if (!isAdmin && bet.userId !== userId) throw new ForbiddenException();

    if (bet.match.status !== MatchStatus.SCHEDULED) {
      throw new BadRequestException('No se puede eliminar una apuesta de un partido en curso o finalizado');
    }

    const deadlineMinutes = this.config.get<number>('BET_DEADLINE_MINUTES', 30);
    const deadline = new Date(bet.match.matchDate.getTime() - deadlineMinutes * 60 * 1000);
    if (new Date() > deadline) {
      throw new BadRequestException('El plazo para cancelar apuestas ya cerró');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.goalScorerPick.deleteMany({ where: { betId: id } });
      return tx.bet.delete({ where: { id } });
    });
  }
}
