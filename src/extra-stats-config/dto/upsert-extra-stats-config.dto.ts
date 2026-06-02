import { IsBoolean, IsNumber, IsOptional, Min } from 'class-validator';

export class UpsertExtraStatsConfigDto {
  @IsBoolean()
  trackGoals: boolean;

  @IsBoolean()
  trackCards: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  goalPoints?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cardPoints?: number;
}
