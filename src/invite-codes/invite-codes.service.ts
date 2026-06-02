import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { InviteCodesRepository } from './invite-codes.repository';

@Injectable()
export class InviteCodesService {
  constructor(private repo: InviteCodesRepository) {}

  async generate(adminId: number) {
    const raw = randomBytes(4).toString('hex').toUpperCase();
    const code = `${raw.slice(0, 4)}-${raw.slice(4)}`;
    return this.repo.create(code, adminId);
  }

  findAll() {
    return this.repo.findAll();
  }

  async remove(id: number) {
    const codes = await this.repo.findAll();
    const found = codes.find((c) => c.id === id);
    if (!found) throw new NotFoundException('Código no encontrado');
    if (found.usado) throw new BadRequestException('No se puede eliminar un código ya utilizado');
    await this.repo.delete(id);
  }

  async validate(code: string): Promise<void> {
    const found = await this.repo.findByCode(code);
    if (!found) throw new BadRequestException('Código de invitación inválido');
    if (found.usado) throw new BadRequestException('El código de invitación ya fue utilizado');
  }

  async consume(code: string, userId: number): Promise<void> {
    await this.repo.markAsUsed(code, userId);
  }
}
