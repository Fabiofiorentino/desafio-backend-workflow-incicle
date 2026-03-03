import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { TemplatesService } from './template.service';
import { CreateTemplateDto } from './dto/create-template.dto';

@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  private extractCompanyId(headers: Record<string, string>): string {
    const companyId = headers['company-id'];

    if (!companyId) {
      throw new BadRequestException('company-id header is required');
    }

    return companyId;
  }

  @Post()
  async create(
    @Headers() headers: Record<string, string>,
    @Body() dto: CreateTemplateDto,
  ) {
    const companyId = this.extractCompanyId(headers);

    return this.templatesService.createTemplate(
      companyId,
      dto.name,
      dto.description,
    );
  }

  @Get()
  async findAll(@Headers() headers: Record<string, string>) {
    const companyId = this.extractCompanyId(headers);
    return this.templatesService.findAll(companyId);
  }

  @Get(':id')
  async findOne(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    const companyId = this.extractCompanyId(headers);
    return this.templatesService.findOne(companyId, id);
  }

  @Post(':id/versions')
  async createVersion(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    const companyId = this.extractCompanyId(headers);
    return this.templatesService.createNewVersion(companyId, id);
  }

  @Post(':id/versions/:versionId/publish')
  async publish(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @Param('versionId') versionId: string,
  ) {
    const companyId = this.extractCompanyId(headers);

    await this.templatesService.publishVersion(companyId, id, versionId);

    return { message: 'Version published successfully' };
  }
}
