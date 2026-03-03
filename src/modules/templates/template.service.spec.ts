import { Test } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';

import { TemplatesService } from './template.service';
import { Template } from './template.entity';
import {
  TemplateVersion,
  TemplateVersionStatus,
} from './template-version.entity';

describe('TemplatesService', () => {
  let service: TemplatesService;

  let templateRepository: jest.Mocked<Repository<Template>>;
  let dataSource: DataSource;

  const managerMock = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  let versionRepository: jest.Mocked<Repository<TemplateVersion>>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TemplatesService,
        {
          provide: getRepositoryToken(Template),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(TemplateVersion),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn((cb) => cb(managerMock)),
          },
        },
      ],
    }).compile();

    service = module.get(TemplatesService);
    templateRepository = module.get(getRepositoryToken(Template));
    versionRepository = module.get(getRepositoryToken(TemplateVersion));
    dataSource = module.get(DataSource);

    jest.clearAllMocks();
  });

  // CRIAÇÃO DE TEMPLATE

  it('deve criar template e versão 1 automaticamente', async () => {
    const createdTemplate = {
      id: 'template1',
      companyId: 'c1',
      name: 'Template Teste',
    };

    templateRepository.create.mockReturnValue(createdTemplate as any);
    templateRepository.save.mockResolvedValue(createdTemplate as any);

    versionRepository.create.mockReturnValue({} as any);
    versionRepository.save.mockResolvedValue({} as any);

    const result = await service.createTemplate(
      'c1',
      'Template Teste',
      'Descrição',
    );

    expect(templateRepository.create).toHaveBeenCalledWith({
      companyId: 'c1',
      name: 'Template Teste',
      description: 'Descrição',
    });

    expect(versionRepository.create).toHaveBeenCalledWith({
      templateId: 'template1',
      version: 1,
      status: TemplateVersionStatus.DRAFT,
    });

    expect(versionRepository.save).toHaveBeenCalled();

    expect(result).toEqual(createdTemplate);
  });

  // MULTI-TENANT

  it('não deve permitir acessar template de outra empresa', async () => {
    templateRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne('empresaA', 'templateX')).rejects.toThrow(
      NotFoundException,
    );
  });

  // PUBLICAÇÃO DE VERSÃO

  describe('publishVersion', () => {
    it('deve publicar versão e despublicar anterior', async () => {
      managerMock.findOne
        .mockResolvedValueOnce({ id: 'template1' }) // template
        .mockResolvedValueOnce({
          id: 'v2',
          status: TemplateVersionStatus.DRAFT,
        }); // versão

      await service.publishVersion('c1', 'template1', 'v2');

      expect(dataSource.transaction).toHaveBeenCalled();

      expect(managerMock.update).toHaveBeenCalledTimes(2);

      expect(managerMock.update).toHaveBeenNthCalledWith(
        1,
        TemplateVersion,
        { templateId: 'template1', status: TemplateVersionStatus.PUBLISHED },
        { status: TemplateVersionStatus.DRAFT },
      );

      expect(managerMock.update).toHaveBeenNthCalledWith(
        2,
        TemplateVersion,
        { id: 'v2' },
        { status: TemplateVersionStatus.PUBLISHED },
      );
    });

    it('deve lançar erro se template não existir', async () => {
      managerMock.findOne.mockResolvedValueOnce(null);

      await expect(
        service.publishVersion('c1', 'template1', 'v2'),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar erro se versão não existir', async () => {
      managerMock.findOne
        .mockResolvedValueOnce({ id: 'template1' })
        .mockResolvedValueOnce(null);

      await expect(
        service.publishVersion('c1', 'template1', 'v2'),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar erro se versão já estiver publicada', async () => {
      managerMock.findOne
        .mockResolvedValueOnce({ id: 'template1' })
        .mockResolvedValueOnce({
          id: 'v2',
          status: TemplateVersionStatus.PUBLISHED,
        });

      await expect(
        service.publishVersion('c1', 'template1', 'v2'),
      ).rejects.toThrow(ConflictException);
    });
  });
});
