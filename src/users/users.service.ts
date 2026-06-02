import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private usersRepo: UsersRepository,
  ) {}

  async findAll() {
    return this.prisma.user.findMany({
      where: { activo: true },
      select: { id: true, email: true, name: true, roles: true, createdAt: true },
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id, activo: true },
      select: { id: true, email: true, name: true, roles: true, createdAt: true },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async remove(id: number, requesterId: number) {
    const user = await this.prisma.user.findUnique({ where: { id, activo: true } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    if (id === requesterId) throw new BadRequestException('No puedes eliminarte a ti mismo');
    await this.usersRepo.softDelete(id);
  }

  async updateRoles(id: number, roles: Role[], requesterId: number) {
    const user = await this.prisma.user.findUnique({ where: { id, activo: true } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (id === requesterId && !roles.includes(Role.ADMIN)) {
      throw new BadRequestException('No puedes quitarte el rol ADMIN a ti mismo');
    }

    return this.prisma.user.update({
      where: { id },
      data: { roles },
      select: { id: true, email: true, name: true, roles: true },
    });
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, activo: true },
      select: {
        id: true,
        email: true,
        name: true,
        roles: true,
        createdAt: true,
        bets: {
          include: { match: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }
}
