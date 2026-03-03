import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstancesService } from './instance.service';
import { Instance } from './instance.entity';
import { Template } from '../templates/template.entity';
import { TemplateVersion } from '../templates/template-version.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('InstancesService - Snapshot imutável', () => {
  let service: InstancesService;
  let templateRepo: Repository<Template>;
  let versionRepo: Repository<TemplateVersion>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Instance, Template, TemplateVersion],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Instance, Template, TemplateVersion]),
      ],
      providers: [InstancesService],
    }).compile();

    service = module.get<InstancesService>(InstancesService);
    templateRepo = module.get(getRepositoryToken(Template));
    versionRepo = module.get(getRepositoryToken(TemplateVersion));
  });

  it('deve manter o snapshot imutável mesmo que a versão do modelo seja alterada', async () => {
    // cria template
    const template = await templateRepo.save({
      name: 'Template A',
      description: 'Original',
      companyId: 'company-1',
    });

    // cria versão
    const version = await versionRepo.save({
      template,
      version: 1,
      isActive: true,
    });

    // cria instância
    const instance = await service.create(version.id);

    const originalSnapshot = instance.snapshot;

    // altera versão depois
    version.isActive = false;
    await versionRepo.save(version);

    // busca instância novamente
    const reloaded = await service.findOne(instance.id);

    expect(reloaded.snapshot).toEqual(originalSnapshot);
  });

  it('Não deve ser permitida a atualização do snapshot após o envio', async () => {
    const template = await templateRepo.save({
      name: 'Template B',
      description: 'Test',
      companyId: 'company-1',
    });

    const version = await versionRepo.save({
      template,
      version: 1,
      isActive: true,
    });

    const instance = await service.create(version.id);

    await service.submit(instance.id);

    await expect(
      service.updateSnapshot(instance.id, { hacked: true }),
    ).rejects.toThrow();
  });
});
