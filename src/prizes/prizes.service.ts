import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrizeFase } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePrizeDto } from './dto/create-prize.dto';
import { AwardPrizeDto } from './dto/award-prize.dto';

@Injectable()
export class PrizesService {
  constructor(private prisma: PrismaService) {}

  async findAll(fase?: PrizeFase) {
    return this.prisma.prize.findMany({
      where: fase ? { fase } : undefined,
      include: { awardedTo: { select: { id: true, name: true, email: true } } },
      orderBy: { position: 'asc' },
    });
  }

  async create(dto: CreatePrizeDto) {
    const exists = await this.prisma.prize.findFirst({ where: { position: dto.position, fase: dto.fase } });
    if (exists) throw new ConflictException(`Ya existe un premio para la posición ${dto.position} en la fase ${dto.fase}`);

    return this.prisma.prize.create({ data: dto });
  }

  async award(id: number, dto: AwardPrizeDto) {
    const prize = await this.prisma.prize.findUnique({ where: { id } });
    if (!prize) throw new NotFoundException('Premio no encontrado');

    const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    return this.prisma.prize.update({
      where: { id },
      data: { awardedToUserId: dto.userId },
      include: { awardedTo: { select: { id: true, name: true, email: true } } },
    });
  }

  async remove(id: number) {
    const prize = await this.prisma.prize.findUnique({ where: { id } });
    if (!prize) throw new NotFoundException('Premio no encontrado');
    return this.prisma.prize.delete({ where: { id } });
  }
}
