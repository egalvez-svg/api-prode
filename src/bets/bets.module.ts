import { Module } from '@nestjs/common';
import { BetsService } from './bets.service';
import { BetsController } from './bets.controller';
import { ExtraStatsConfigModule } from '../extra-stats-config/extra-stats-config.module';

@Module({
  imports: [ExtraStatsConfigModule],
  controllers: [BetsController],
  providers: [BetsService],
})
export class BetsModule {}
