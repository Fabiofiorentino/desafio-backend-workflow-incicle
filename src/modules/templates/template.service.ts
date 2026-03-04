import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Template } from './template.entity';
import {
  TemplateVersion,
  TemplateVersionStatus,
} from './template-version.entity';

@Injectable()
export class TemplatesService {
  constructor(
    @InjectRepository(Template)
    private readonly templateRepo: Repository<Template>,

    @InjectRepository(TemplateVersion)
    private readonly versionRepo: Repository<TemplateVersion>,

    private readonly dataSource: DataSource,
  ) {}

  // Criar template
  async createTemplate(
    companyId: string,
    name: string,
    description?: string,
    schema: Record<string, any> = {},
  ): Promise<Template> {
    const template = this.templateRepo.create({
      companyId,
      name,
      description,
    });

    await this.templateRepo.save(template);

    const version = this.versionRepo.create({
      templateId: template.id,
      version: 1,
      status: TemplateVersionStatus.DRAFT,
      schema,
    });

    await this.versionRepo.save(version);

    return template;
  }

  // Listar templates por empresa
  async findAll(companyId: string): Promise<Template[]> {
    return this.templateRepo.find({
      where: { companyId },
      relations: ['versions'],
    });
  }

  // Buscar template isolado por empresa
  async findOne(companyId: string, templateId: string): Promise<Template> {
    const template = await this.templateRepo.findOne({
      where: { id: templateId, companyId },
      relations: ['versions'],
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return template;
  }

  // Criar nova versão DRAFT
  async createNewVersion(
    companyId: string,
    templateId: string,
  ): Promise<TemplateVersion> {
    const template = await this.templateRepo.findOne({
      where: { id: templateId, companyId },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    const lastVersion = await this.versionRepo
      .createQueryBuilder('v')
      .where('v.template_id = :templateId', { templateId })
      .orderBy('v.version', 'DESC')
      .getOne();

    const nextVersion = lastVersion ? lastVersion.version + 1 : 1;

    const version = this.versionRepo.create({
      templateId,
      version: nextVersion,
      status: TemplateVersionStatus.DRAFT,
      schema: lastVersion?.schema ?? {},
    });

    return this.versionRepo.save(version);
  }

  // Publicar versão (transaction obrigatória)
  async publishVersion(
    companyId: string,
    templateId: string,
    versionId: string,
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const template = await manager.findOne(Template, {
        where: { id: templateId, companyId },
      });

      if (!template) {
        throw new NotFoundException('Template not found');
      }

      const version = await manager.findOne(TemplateVersion, {
        where: {
          id: versionId,
          templateId,
        },
        relations: ['template'],
      });

      if (!version || version.template.companyId !== companyId) {
        throw new NotFoundException('Version not found');
      }

      if (version.status === TemplateVersionStatus.PUBLISHED) {
        throw new ConflictException('Version already published');
      }

      // Despublica versão anterior
      await manager.update(
        TemplateVersion,
        {
          templateId,
          status: TemplateVersionStatus.PUBLISHED,
        },
        {
          status: TemplateVersionStatus.DRAFT,
        },
      );

      // Publica nova
      await manager.update(
        TemplateVersion,
        { id: versionId },
        { status: TemplateVersionStatus.PUBLISHED },
      );
    });
  }
}
