import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, ParseIntPipe, Query, UseGuards,
} from '@nestjs/common';
import { PrizeFase, Role } from '@prisma/client';
import { PrizesService } from './prizes.service';
import { CreatePrizeDto } from './dto/create-prize.dto';
import { AwardPrizeDto } from './dto/award-prize.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('prizes')
export class PrizesController {
  constructor(private prizes: PrizesService) {}

  @Get()
  findAll(@Query('fase') fase?: PrizeFase) {
    return this.prizes.findAll(fase);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreatePrizeDto) {
    return this.prizes.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/award')
  award(@Param('id', ParseIntPipe) id: number, @Body() dto: AwardPrizeDto) {
    return this.prizes.award(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.prizes.remove(id);
  }
}
