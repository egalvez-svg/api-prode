import { Controller, Get, Patch, Delete, Param, ParseIntPipe, UseGuards, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateRolesDto } from './dto/update-roles.dto';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get('me')
  getProfile(@CurrentUser() user: { id: number }) {
    return this.users.getProfile(user.id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  findAll() {
    return this.users.findAll();
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.users.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/roles')
  updateRoles(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRolesDto,
    @CurrentUser() requester: { id: number },
  ) {
    return this.users.updateRoles(id, dto.roles, requester.id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() requester: { id: number },
  ) {
    return this.users.remove(id, requester.id);
  }
}
