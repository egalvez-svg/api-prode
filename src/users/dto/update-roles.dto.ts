import { IsArray, IsEnum, ArrayMinSize, ArrayUnique } from 'class-validator';
import { Role } from '@prisma/client';

export class UpdateRolesDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsEnum(Role, { each: true })
  roles: Role[];
}
