import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Instance, InstanceStatus } from './instance.entity';
import { TemplateVersion } from '../templates/template-version.entity';

@Injectable()
export class InstancesService {
  constructor(
    @InjectRepository(Instance)
    private readonly instanceRepo: Repository<Instance>,

    @InjectRepository(TemplateVersion)
    private readonly templateVersionRepo: Repository<TemplateVersion>,
  ) {}

  async create(
    companyId: string,
    templateVersionId: string,
  ): Promise<Instance> {
    const templateVersion = await this.templateVersionRepo.findOne({
      where: { companyId, id: templateVersionId },
    });

    if (!templateVersion) {
      throw new NotFoundException('Versão não encontrada');
    }

    const snapshot = JSON.parse(JSON.stringify(templateVersion));

    const instance = this.instanceRepo.create({
      templateVersion,
      snapshot,
      status: InstanceStatus.DRAFT,
    });

    return this.instanceRepo.save(instance);
  }

  async submit(companyId: string, id: string): Promise<Instance> {
    const instance = await this.findOne({
      where: { id, companyId },
      relations: ['templateVersion'],
    });

    if (instance.status === InstanceStatus.SUBMITTED) {
      throw new BadRequestException('Instância já foi submetida');
    }

    instance.status = InstanceStatus.SUBMITTED;
    instance.submittedAt = new Date();

    return this.instanceRepo.save(instance);
  }

  async findAll(companyId: string): Promise<Instance[]> {
    return this.instanceRepo.find({
      where: { companyId },
      relations: ['templateVersion'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(companyId: string, id: string): Promise<Instance> {
    const instance = await this.instanceRepo.findOne({
      where: { id, companyId },
      relations: ['templateVersion'],
    });

    if (!instance) {
      throw new NotFoundException('Instância não encontrada');
    }

    return instance;
  }

  async getTimeline(companyId: string, id: string) {
    const instance = await this.findOne(companyId, id);

    const timeline = [
      {
        type: 'created',
        date: instance.createdAt,
      },
    ];

    if (instance.submittedAt) {
      timeline.push({
        type: 'submitted',
        date: instance.submittedAt,
      });
    }

    return {
      instanceId: instance.id,
      status: instance.status,
      events: timeline.sort((a, b) => a.date.getTime() - b.date.getTime()),
    };
  }

  async updateSnapshot(
    companyId: string,
    id: string,
    newSnapshot: any,
  ): Promise<Instance> {
    const instance = await this.findOne(companyId, id);

    if (instance.status === InstanceStatus.SUBMITTED) {
      throw new BadRequestException(
        'Não é possível modificar o snapshot após a submissão',
      );
    }

    instance.snapshot = newSnapshot;

    return this.instanceRepo.save(instance);
  }
}
