import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
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

  @IsEnum(PrizeFase)
  fase: PrizeFase;
}
