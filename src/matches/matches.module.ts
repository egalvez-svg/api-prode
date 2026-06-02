import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { ExtraStatsConfigModule } from '../extra-stats-config/extra-stats-config.module';

@Module({
  imports: [HttpModule, ExtraStatsConfigModule],
  controllers: [MatchesController],
  providers: [MatchesService],
  exports: [MatchesService],
})
export class MatchesModule {}
