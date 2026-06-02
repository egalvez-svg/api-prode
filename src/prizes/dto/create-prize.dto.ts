import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreatePrizeDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(1)
  position: number;
}
