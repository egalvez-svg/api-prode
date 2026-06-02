import { PrismaClient, MatchStatus, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import axios from 'axios';

const prisma = new PrismaClient();

const STATUS_MAP: Record<string, MatchStatus> = {
  SCHEDULED: MatchStatus.SCHEDULED,
  TIMED: MatchStatus.SCHEDULED,
  IN_PLAY: MatchStatus.IN_PLAY,
  PAUSED: MatchStatus.IN_PLAY,
  FINISHED: MatchStatus.FINISHED,
  POSTPONED: MatchStatus.POSTPONED,
};

async function seedAdmin() {
  const hashed = await bcrypt.hash('Acri0340$$', 10);
  await prisma.user.upsert({
    where: { email: 'ea.galvez.monardez@gmail.com' },
    update: {},
    create: {
      email: 'ea.galvez.monardez@gmail.com',
      name: 'Eduardo Galvez',
      password: hashed,
      roles: [Role.ADMIN, Role.USER],
    },
  });
  console.log('✓ Admin listo');
}

async function seedMatches() {
  const apiKey = process.env.FOOTBALL_API_KEY;
  const baseUrl = process.env.FOOTBALL_API_URL;

  if (!apiKey || !baseUrl) {
    console.warn('⚠ FOOTBALL_API_KEY o FOOTBALL_API_URL no configurados — se omite carga de partidos');
    return;
  }

  console.log('  Consultando football-data.org...');
  const { data } = await axios.get<{ matches: FootballMatch[] }>(
    `${baseUrl}/competitions/WC/matches`,
    { headers: { 'X-Auth-Token': apiKey } },
  );

  let creados = 0;
  let actualizados = 0;

  for (const m of data.matches) {
    if (!m.homeTeam?.name || !m.awayTeam?.name) continue;

    const status = STATUS_MAP[m.status] ?? MatchStatus.SCHEDULED;
    const existing = await prisma.match.findUnique({ where: { externalId: m.id } });

    if (existing) {
      await prisma.match.update({
        where: { externalId: m.id },
        data: {
          status,
          homeScore: m.score?.fullTime?.home ?? null,
          awayScore: m.score?.fullTime?.away ?? null,
        },
      });
      actualizados++;
    } else {
      await prisma.match.create({
        data: {
          externalId: m.id,
          homeTeam: m.homeTeam.name,
          awayTeam: m.awayTeam.name,
          matchDate: new Date(m.utcDate),
          status,
          stage: m.stage ?? null,
          group: m.group ?? null,
          homeScore: m.score?.fullTime?.home ?? null,
          awayScore: m.score?.fullTime?.away ?? null,
        },
      });
      creados++;
    }
  }

  console.log(`✓ Partidos: ${creados} creados, ${actualizados} actualizados`);
}

interface FootballMatch {
  id: number;
  utcDate: string;
  status: string;
  stage: string | null;
  group: string | null;
  homeTeam: { name: string } | null;
  awayTeam: { name: string } | null;
  score: {
    fullTime: { home: number | null; away: number | null };
  };
}

async function main() {
  console.log('Iniciando seed...\n');
  await seedAdmin();
  await seedMatches();
  console.log('\nSeed completado.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
