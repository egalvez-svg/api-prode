import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  async softDelete(id: number) {
    await this.prisma.$executeRaw`UPDATE "User" SET "activo" = false WHERE "id" = ${id}`;
  }

  async updateAcceso(id: number, accesoGrupos: boolean, accesoEliminatoria: boolean) {
    return this.prisma.user.update({
      where: { id },
      data: { accesoGrupos, accesoEliminatoria },
      select: { id: true, email: true, name: true, accesoGrupos: true, accesoEliminatoria: true },
    });
  }
}
