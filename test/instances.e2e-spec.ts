import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Instances E2E', () => {
  let app: INestApplication;
  let templateVersionId: string;
  let instanceId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('workflow completo', async () => {
    // criar template
    const templateRes = await request(app.getHttpServer())
      .post('/templates')
      .set('company-id', 'company-1')
      .send({
        name: 'Workflow Test',
      })
      .expect(201);

    const templateId = templateRes.body.id;

    // criar versão
    const versionRes = await request(app.getHttpServer())
      .post(`/templates/${templateId}/versions`)
      .set('company-id', 'company-1')
      .expect(201);

    templateVersionId = versionRes.body.id;

    // criar instance
    const instanceRes = await request(app.getHttpServer())
      .post('/instances')
      .set('company-id', 'company-1')
      .send({
        templateVersionId,
      })
      .expect(201);

    instanceId = instanceRes.body.id;

    expect(instanceRes.body.status).toBe('DRAFT');

    // submit
    const submitRes = await request(app.getHttpServer())
      .post(`/instances/${instanceId}/submit`)
      .set('company-id', 'company-1')
      .expect(200);

    expect(submitRes.body.status).toBe('SUBMITTED');

    // timeline
    const timelineRes = await request(app.getHttpServer())
      .get(`/instances/${instanceId}/timeline`)
      .set('company-id', 'company-1')
      .expect(200);

    expect(timelineRes.body.events.length).toBeGreaterThanOrEqual(2);
  });
});
