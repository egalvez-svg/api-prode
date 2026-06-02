import { IsArray, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateBetDto {
  @IsInt()
  matchId: number;

  @IsInt()
  @Min(0)
  homeScore: number;

  @IsInt()
  @Min(0)
  awayScore: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  goalScorerPicks?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  yellowHomePick?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  yellowAwayPick?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  redHomePick?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  redAwayPick?: number;
}
