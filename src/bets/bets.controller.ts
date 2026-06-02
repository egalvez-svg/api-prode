import {
  Controller, Get, Post, Delete,
  Body, Param, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { BetsService } from './bets.service';
import { CreateBetDto } from './dto/create-bet.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('bets')
export class BetsController {
  constructor(private bets: BetsService) {}

  @Post()
  create(@CurrentUser() user: { id: number }, @Body() dto: CreateBetDto) {
    return this.bets.create(user.id, dto);
  }

  @Get('me')
  findMine(@CurrentUser() user: { id: number }) {
    return this.bets.findMyBets(user.id);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number; roles: Role[] },
  ) {
    return this.bets.findOne(id, user.id, user.roles?.includes(Role.ADMIN));
  }

  @Delete(':id')
  delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number; roles: Role[] },
  ) {
    return this.bets.delete(id, user.id, user.roles?.includes(Role.ADMIN));
  }
}
