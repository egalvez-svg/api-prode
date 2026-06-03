import { IsBoolean } from 'class-validator';

export class UpdateUserAccesoDto {
  @IsBoolean({ message: 'accesoGrupos debe ser un valor booleano' })
  accesoGrupos: boolean;

  @IsBoolean({ message: 'accesoEliminatoria debe ser un valor booleano' })
  accesoEliminatoria: boolean;
}
