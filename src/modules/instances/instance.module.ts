import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Instance } from './instance.entity';
import { TemplateVersion } from '../templates/template-version.entity';
import { InstancesService } from './instance.service';
import { InstancesController } from './instance.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Instance, TemplateVersion])],
  controllers: [InstancesController],
  providers: [InstancesService],
  exports: [InstancesService],
})
export class InstancesModule {}
