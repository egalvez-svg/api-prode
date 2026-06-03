import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PrizeFase } from '@prisma/client';

export class CreatePrizeDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(1)
  position: number;

  @IsIn(['GRUPOS', 'ELIMINATORIA'])
  fase: PrizeFase;
}
