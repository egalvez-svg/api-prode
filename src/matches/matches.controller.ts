import { Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, MatchStatus } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('matches')
export class MatchesController {
  constructor(private matches: MatchesService) {}

  @Get('groups')
  findGroups() {
    return this.matches.findGroups();
  }

  @Get()
  findAll(@Query('status') status?: MatchStatus) {
    return this.matches.findAll(status);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.matches.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post('sync')
  sync() {
    return this.matches.syncMatches();
  }
}
