import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Template } from './template.entity';
import { TemplateVersion } from './template-version.entity';
import { TemplatesService } from './template.service';
import { TemplatesController } from './template.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Template, TemplateVersion])],
  controllers: [TemplatesController],
  providers: [TemplatesService],
  exports: [TemplatesService],
})
export class TemplatesModule {}
