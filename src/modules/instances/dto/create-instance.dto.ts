import { IsUUID } from 'class-validator';

export class CreateInstanceDto {
  @IsUUID()
  templateVersionId: string;
}
