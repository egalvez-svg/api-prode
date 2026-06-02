import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MatchesModule } from './matches/matches.module';
import { BetsModule } from './bets/bets.module';
import { RankingsModule } from './rankings/rankings.module';
import { PrizesModule } from './prizes/prizes.module';
import { InviteCodesModule } from './invite-codes/invite-codes.module';
import { ExtraStatsConfigModule } from './extra-stats-config/extra-stats-config.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    MatchesModule,
    BetsModule,
    RankingsModule,
    PrizesModule,
    InviteCodesModule,
    ExtraStatsConfigModule,
  ],
})
export class AppModule {}
