import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InviteCodesRepository {
  constructor(private prisma: PrismaService) {}

  async create(code: string, creadoPor: number) {
    return this.prisma.inviteCode.create({ data: { code, creadoPor } });
  }

  async findAll() {
    return this.prisma.inviteCode.findMany({ orderBy: { creadoEn: 'desc' } });
  }

  async findByCode(code: string) {
    return this.prisma.inviteCode.findUnique({ where: { code } });
  }

  async markAsUsed(code: string, usadoPor: number) {
    await this.prisma.$executeRaw`UPDATE "InviteCode" SET "usado" = true, "usadoPor" = ${usadoPor} WHERE "code" = ${code}`;
  }

  async delete(id: number) {
    await this.prisma.inviteCode.delete({ where: { id } });
  }
}
