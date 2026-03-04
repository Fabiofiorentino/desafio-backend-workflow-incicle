import { Controller, Post, Get, Param, Body, Req } from '@nestjs/common';
import { InstancesService } from './instance.service';
import { CreateInstanceDto } from './dto/create-instance.dto';

@Controller('instances')
export class InstancesController {
  constructor(private readonly service: InstancesService) {}

  @Post()
  async create(@Body() dto: CreateInstanceDto, @Req() req) {
    return this.service.create(req.companyId, dto.templateVersionId);
  }

  @Post(':id/submit')
  async submit(@Param('id') id: string, @Req() req) {
    return this.service.submit(req.companyId, id);
  }

  @Get()
  async findAll(@Req() req) {
    return this.service.findAll(req.companyId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    return this.service.findOne(req.companyId, id);
  }

  @Get(':id/timeline')
  async timeline(@Param('id') id: string, @Req() req) {
    return this.service.getTimeline(req.companyId, id);
  }
}
