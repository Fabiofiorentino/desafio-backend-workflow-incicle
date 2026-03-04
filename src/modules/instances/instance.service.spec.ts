import { Test, TestingModule } from '@nestjs/testing';
import { InstancesService } from './instance.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Instance } from './instance.entity';
import { TemplateVersion } from '../templates/template-version.entity';

describe('InstancesService', () => {
  let service: InstancesService;
  let instanceRepository: Repository<Instance>;
  let templateVersionRepository: Repository<TemplateVersion>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InstancesService,
        {
          provide: getRepositoryToken(Instance),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(TemplateVersion),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<InstancesService>(InstancesService);
    instanceRepository = module.get(getRepositoryToken(Instance));
    templateVersionRepository = module.get(getRepositoryToken(TemplateVersion));
  });

  it('deve criar instance com snapshot imutável', async () => {
    const templateVersionMock = {
      id: 'version-1',
      schema: { fields: ['name', 'description'] },
    };

    (templateVersionRepository.findOne as jest.Mock).mockResolvedValue(
      templateVersionMock,
    );

    (instanceRepository.create as jest.Mock).mockImplementation((data) => data);
    (instanceRepository.save as jest.Mock).mockImplementation((data) => ({
      id: 'instance-1',
      ...data,
    }));

    const result = await service.create('company-1', 'version-1');

    expect(result.snapshot).toEqual(templateVersionMock.schema);
    expect(result.templateVersionId).toBe('version-1');
  });

  it('não deve alterar snapshot se templateVersion mudar depois', async () => {
    const originalSchema = { fields: ['name'] };

    (templateVersionRepository.findOne as jest.Mock).mockResolvedValue({
      id: 'version-1',
      schema: originalSchema,
    });

    (instanceRepository.create as jest.Mock).mockImplementation((data) => data);
    (instanceRepository.save as jest.Mock).mockImplementation((data) => ({
      id: 'instance-1',
      ...data,
    }));

    const instance = await service.create('company-1', 'version-1');

    // simula mudança futura no template
    originalSchema.fields.push('email');

    expect(instance.snapshot).toEqual({ fields: ['name'] });
  });

  it('deve lançar erro se templateVersion não existir', async () => {
    (templateVersionRepository.findOne as jest.Mock).mockResolvedValue(null);

    await expect(service.create('company-1', 'invalido')).rejects.toThrow();
  });
});
