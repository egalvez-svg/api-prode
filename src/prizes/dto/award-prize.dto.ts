import { IsInt } from 'class-validator';

export class AwardPrizeDto {
  @IsInt()
  userId: number;
}
