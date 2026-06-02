import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ExtraStatsConfigService } from './extra-stats-config.service';
import { UpsertExtraStatsConfigDto } from './dto/upsert-extra-stats-config.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('extra-stats-config')
export class ExtraStatsConfigController {
  constructor(private service: ExtraStatsConfigService) {}

  @Get('stage')
  findAllStage() {
    return this.service.findAllStage();
  }

  @Get('match')
  findAllMatch() {
    return this.service.findAllMatch();
  }

  @Put('stage/:stage')
  upsertStage(
    @Param('stage') stage: string,
    @Body() dto: UpsertExtraStatsConfigDto,
  ) {
    return this.service.upsertStage(stage, dto);
  }

  @Put('match/:matchId')
  upsertMatch(
    @Param('matchId', ParseIntPipe) matchId: number,
    @Body() dto: UpsertExtraStatsConfigDto,
  ) {
    return this.service.upsertMatch(matchId, dto);
  }

  @Delete('stage/:stage')
  deleteStage(@Param('stage') stage: string) {
    return this.service.deleteStage(stage);
  }

  @Delete('match/:matchId')
  deleteMatch(@Param('matchId', ParseIntPipe) matchId: number) {
    return this.service.deleteMatch(matchId);
  }
}
