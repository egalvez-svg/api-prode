import { Controller, Get, Post, Delete, Param, ParseIntPipe, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { InviteCodesService } from './invite-codes.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('invite-codes')
export class InviteCodesController {
  constructor(private inviteCodes: InviteCodesService) {}

  @Post()
  generate(@CurrentUser() user: { id: number }) {
    return this.inviteCodes.generate(user.id);
  }

  @Get()
  findAll() {
    return this.inviteCodes.findAll();
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.inviteCodes.remove(id);
  }
}
