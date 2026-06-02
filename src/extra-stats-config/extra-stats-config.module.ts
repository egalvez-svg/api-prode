import { Module } from '@nestjs/common';
import { ExtraStatsConfigService } from './extra-stats-config.service';
import { ExtraStatsConfigController } from './extra-stats-config.controller';

@Module({
  controllers: [ExtraStatsConfigController],
  providers: [ExtraStatsConfigService],
  exports: [ExtraStatsConfigService],
})
export class ExtraStatsConfigModule {}
