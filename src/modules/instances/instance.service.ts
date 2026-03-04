import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Instance } from './instance.entity';
import {
  TemplateVersion,
  TemplateVersionStatus,
} from '../templates/template-version.entity';

@Injectable()
export class InstancesService {
  constructor(
    @InjectRepository(Instance)
    private readonly instanceRepo: Repository<Instance>,

    @InjectRepository(TemplateVersion)
    private readonly templateVersionRepo: Repository<TemplateVersion>,
  ) { }

  async create(
    companyId: string,
    templateVersionId: string,
  ): Promise<Instance> {
    const templateVersion = await this.templateVersionRepo.findOne({
      where: {
        id: templateVersionId,
        template: {
          companyId,
        },
        status: TemplateVersionStatus.PUBLISHED,
      },
      relations: ['template'],
    });

    if (!templateVersion) {
      throw new NotFoundException(
        'Versão publicada não encontrada para esta empresa',
      );
    }

    const instance = this.instanceRepo.create({
      companyId,
      templateVersionId: templateVersion.id,
      snapshot: {
        version: templateVersion.version,
        templateId: templateVersion.templateId,
      },
      status: 'draft',
    });

    return this.instanceRepo.save(instance);
  }

  async submit(companyId: string, id: string): Promise<Instance> {
    const instance = await this.findOne(companyId, id);

    if (instance.status === 'submitted') {
      throw new BadRequestException('Instância já submetida');
    }

    instance.status = 'submitted';
    instance.submittedAt = new Date();

    return this.instanceRepo.save(instance);
  }

  async findAll(companyId: string): Promise<Instance[]> {
    return this.instanceRepo.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(companyId: string, id: string): Promise<Instance> {
    const instance = await this.instanceRepo.findOne({
      where: { id, companyId },
    });

    if (!instance) {
      throw new NotFoundException('Instância não encontrada');
    }

    return instance;
  }

  async getTimeline(companyId: string, id: string) {
    const instance = await this.findOne(companyId, id);

    const events = [{ type: 'created', date: instance.createdAt }];

    if (instance.submittedAt) {
      events.push({ type: 'submitted', date: instance.submittedAt });
    }

    return {
      instanceId: instance.id,
      status: instance.status,
      events: events.sort((a, b) => a.date.getTime() - b.date.getTime()),
    };
  }
}
