import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  async softDelete(id: number) {
    await this.prisma.$executeRaw`UPDATE "User" SET "activo" = false WHERE "id" = ${id}`;
  }
}
