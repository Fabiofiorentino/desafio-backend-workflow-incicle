import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import {
  HealthCheckService,
  TypeOrmHealthIndicator,
  HealthCheck,
} from '@nestjs/terminus';
import { RabbitService } from '../rabbitmq/rabbit.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private rabbit: RabbitService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Verificação de liveness' })
  @ApiOkResponse({ description: 'Serviço ativo' })
  liveness() {
    return { status: 'ok' };
  }

  @Get('ready')
  @HealthCheck()
  @ApiOperation({ summary: 'Verificação de prontidão' })
  @ApiOkResponse({ description: 'Serviço e dependências prontas' })
  readiness() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      async () => {
        await this.rabbit.publish('health_check', { ping: true });
        return { rabbitmq: { status: 'up' } };
      },
    ]);
  }
}
