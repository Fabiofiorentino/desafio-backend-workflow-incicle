import { Module, Global } from '@nestjs/common';
import { RabbitService } from './rabbit.service';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [RabbitService],
  exports: [RabbitService],
})
export class RabbitModule {}
