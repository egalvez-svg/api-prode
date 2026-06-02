import { Controller, Get, UseGuards } from '@nestjs/common';
import { RankingsService } from './rankings.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('rankings')
export class RankingsController {
  constructor(private rankings: RankingsService) {}

  @Get()
  getLeaderboard() {
    return this.rankings.getLeaderboard();
  }

  @Get('me')
  getMyPosition(@CurrentUser() user: { id: number }) {
    return this.rankings.getUserPosition(user.id);
  }
}
