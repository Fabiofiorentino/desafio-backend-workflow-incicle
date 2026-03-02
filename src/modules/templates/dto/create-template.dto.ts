import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateTemplateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsObject()
  definition: Record<string, any>;
}
