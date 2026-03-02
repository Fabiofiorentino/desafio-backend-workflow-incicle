import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  TypeOrmHealthIndicator,
  HealthCheck,
} from '@nestjs/terminus';
import { RabbitService } from '../rabbitmq/rabbit.service';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private rabbit: RabbitService,
  ) {}

  @Get()
  liveness() {
    return { status: 'ok' };
  }

  @Get('ready')
  @HealthCheck()
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
