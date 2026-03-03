import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { InstancesService } from './instance.service';
import { CreateInstanceDto } from './dto/create-instance.dto';

@Controller('instances')
export class InstancesController {
  constructor(private readonly instancesService: InstancesService) {}

  @Post()
  async create(@Body() dto: CreateInstanceDto) {
    return this.instancesService.create(dto.templateVersionId);
  }

  @Post(':id/submit')
  async submit(@Param('id') id: string) {
    return this.instancesService.submit(id);
  }

  @Get()
  async findAll() {
    return this.instancesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.instancesService.findOne(id);
  }

  @Get(':id/timeline')
  async timeline(@Param('id') id: string) {
    return this.instancesService.getTimeline(id);
  }
}
