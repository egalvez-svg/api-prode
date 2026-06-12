import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { ExtraStatsConfigService } from '../extra-stats-config/extra-stats-config.service';
import { MatchStatus, GoalTeamSide } from '@prisma/client';

const STATUS_MAP: Record<string, MatchStatus> = {
  SCHEDULED: MatchStatus.SCHEDULED,
  TIMED: MatchStatus.SCHEDULED,
  IN_PLAY: MatchStatus.IN_PLAY,
  PAUSED: MatchStatus.IN_PLAY,
  FINISHED: MatchStatus.FINISHED,
  POSTPONED: MatchStatus.POSTPONED,
};

interface ApiGoal {
  scorer?: { name?: string };
  team?: { id?: number };
}

interface ApiBooking {
  card?: string;
  team?: { id?: number };
}

interface ApiMatch {
  id: number;
  utcDate: string;
  status: string;
  stage?: string;
  group?: string;
  homeTeam?: { id?: number; name?: string };
  awayTeam?: { id?: number; name?: string };
  score?: { fullTime?: { home?: number; away?: number } };
  goals?: ApiGoal[];
  bookings?: ApiBooking[];
}

@Injectable()
export class MatchesService {
  private readonly logger = new Logger(MatchesService.name);

  constructor(
    private prisma: PrismaService,
    private http: HttpService,
    private config: ConfigService,
    private extraStatsConfig: ExtraStatsConfigService,
  ) {}

  async findAll(status?: MatchStatus) {
    return this.prisma.match.findMany({
      where: status ? { status } : undefined,
      orderBy: { matchDate: 'asc' },
    });
  }

  async findGroups() {
    const matches = await this.prisma.match.findMany({
      where: { group: { not: null } },
      select: { group: true, homeTeam: true, awayTeam: true },
    });

    const map: Record<string, Set<string>> = {};
    for (const m of matches) {
      if (!m.group) continue;
      if (!map[m.group]) map[m.group] = new Set();
      map[m.group].add(m.homeTeam);
      map[m.group].add(m.awayTeam);
    }

    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([group, teams]) => ({ group, teams: Array.from(teams).sort() }));
  }

  async findOne(id: number) {
    const match = await this.prisma.match.findUnique({
      where: { id },
      include: { goalEvents: true },
    });
    if (!match) throw new NotFoundException('Partido no encontrado');
    return match;
  }

  async toggleCountForRanking(id: number) {
    const match = await this.prisma.match.findUnique({ where: { id } });
    if (!match) throw new NotFoundException('Partido no encontrado');
    return this.prisma.match.update({
      where: { id },
      data: { countForRanking: !match.countForRanking },
      select: { id: true, countForRanking: true },
    });
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async syncMatches() {
    this.logger.log('Sincronizando partidos con football-data.org...');
    try {
      const apiKey = this.config.get<string>('FOOTBALL_API_KEY');
      const baseUrl = this.config.get<string>('FOOTBALL_API_URL');

      const { data } = await firstValueFrom(
        this.http.get(`${baseUrl}/competitions/WC/matches`, {
          headers: { 'X-Auth-Token': apiKey },
        }),
      );

      for (const m of data.matches as ApiMatch[]) {
        const homeTeam = m.homeTeam?.name;
        const awayTeam = m.awayTeam?.name;
        const status = STATUS_MAP[m.status] ?? MatchStatus.SCHEDULED;
        const homeScore = m.score?.fullTime?.home ?? null;
        const awayScore = m.score?.fullTime?.away ?? null;

        if (!homeTeam || !awayTeam) {
          await this.prisma.match.updateMany({
            where: { externalId: m.id },
            data: { status, homeScore, awayScore },
          });
          continue;
        }

        const upserted = await this.prisma.match.upsert({
          where: { externalId: m.id },
          update: { homeTeam, awayTeam, status, homeScore, awayScore },
          create: {
            externalId: m.id,
            homeTeam,
            awayTeam,
            matchDate: new Date(m.utcDate),
            status,
            stage: m.stage,
            group: m.group ?? null,
            homeScore,
            awayScore,
          },
        });

        if (status === MatchStatus.FINISHED) {
          const config = await this.extraStatsConfig.getExtraConfigForMatch(
            upserted.id,
            upserted.stage,
          );

          if (config.trackGoals) {
            const goals = m.goals ?? [];
            const goalData = goals
              .filter((g) => !!g.scorer?.name)
              .map((g) => ({
                matchId: upserted.id,
                player: g.scorer!.name!,
                team:
                  g.team?.id === m.homeTeam?.id
                    ? GoalTeamSide.home
                    : GoalTeamSide.away,
              }));

            await this.prisma.$transaction([
              this.prisma.goalEvent.deleteMany({ where: { matchId: upserted.id } }),
              this.prisma.goalEvent.createMany({ data: goalData }),
            ]);
          }

          if (config.trackCards) {
            const bookings = m.bookings ?? [];
            const homeId = m.homeTeam?.id;
            const awayId = m.awayTeam?.id;

            const yellowHome = bookings.filter(
              (b) => b.card === 'YELLOW_CARD' && b.team?.id === homeId,
            ).length;
            const yellowAway = bookings.filter(
              (b) => b.card === 'YELLOW_CARD' && b.team?.id === awayId,
            ).length;
            const redHome = bookings.filter(
              (b) =>
                (b.card === 'RED_CARD' || b.card === 'YELLOW_RED_CARD') &&
                b.team?.id === homeId,
            ).length;
            const redAway = bookings.filter(
              (b) =>
                (b.card === 'RED_CARD' || b.card === 'YELLOW_RED_CARD') &&
                b.team?.id === awayId,
            ).length;

            await this.prisma.match.update({
              where: { id: upserted.id },
              data: { yellowHome, yellowAway, redHome, redAway },
            });
          }
        }
      }

      this.logger.log(`Sincronizados ${data.matches.length} partidos`);
      await this.calculateBetPoints();
    } catch (err) {
      this.logger.error('Error sincronizando partidos', (err as Error)?.message);
    }
  }

  private async calculateBetPoints() {
    const finished = await this.prisma.match.findMany({
      where: { status: MatchStatus.FINISHED, homeScore: { not: null }, awayScore: { not: null } },
      include: {
        bets: {
          include: { goalScorerPicks: true },
        },
        goalEvents: true,
      },
    });

    for (const match of finished) {
      const actualHome = match.homeScore!;
      const actualAway = match.awayScore!;
      const actualResult = Math.sign(actualHome - actualAway);

      const config = await this.extraStatsConfig.getExtraConfigForMatch(match.id, match.stage);

      for (const bet of match.bets) {
        const betResult = Math.sign(bet.homeScore - bet.awayScore);
        let basePoints = 0;

        if (bet.homeScore === actualHome && bet.awayScore === actualAway) {
          basePoints = 3;
        } else if (betResult === actualResult) {
          basePoints = 1;
        }

        let points: number = basePoints;

        if (config.trackGoals && match.goalEvents.length > 0) {
          const actualScorers = match.goalEvents.map((g) => g.player);
          for (const pick of bet.goalScorerPicks) {
            if (actualScorers.includes(pick.player)) points += config.goalPoints;
          }
        }

        if (config.trackCards) {
          if (match.yellowHome !== null && bet.yellowHomePick === match.yellowHome) points += config.cardPoints;
          if (match.yellowAway !== null && bet.yellowAwayPick === match.yellowAway) points += config.cardPoints;
          if (match.redHome !== null && bet.redHomePick === match.redHome) points += config.cardPoints;
          if (match.redAway !== null && bet.redAwayPick === match.redAway) points += config.cardPoints;
        }

        if (bet.points !== points || bet.basePoints !== basePoints) {
          await this.prisma.bet.update({ where: { id: bet.id }, data: { points, basePoints } });
        }
      }
    }
  }
}
