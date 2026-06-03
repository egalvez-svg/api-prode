import { IsBoolean, IsOptional } from 'class-validator';

export class CreateInviteCodeDto {
  @IsOptional()
  @IsBoolean()
  accesoGrupos: boolean = false;

  @IsOptional()
  @IsBoolean()
  accesoEliminatoria: boolean = false;
}
