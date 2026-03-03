import * as amqp from 'amqplib';
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RabbitService implements OnModuleInit {
  private connection: amqp.ChannelModel;
  private channel: amqp.Channel;
  private readonly logger = new Logger(RabbitService.name);

  constructor(private config: ConfigService) {}

  async onModuleInit() {
    await this.connectWithRetry();
  }

  private async connectWithRetry(retries = 10, delay = 3000) {
    const url = this.config.get<string>('ASYNC_URL');

    for (let i = 0; i < retries; i++) {
      try {
        this.connection = await amqp.connect(url);
        this.channel = await this.connection.createChannel();
        this.logger.log('RabbitMQ conectado');
        return;
      } catch (err) {
        this.logger.warn(
          `RabbitMQ indisponível. Tentativa ${i + 1}/${retries}`,
        );
        console.error(err);
        await new Promise((res) => setTimeout(res, delay));
      }
    }

    throw new Error('Não foi possível conectar ao RabbitMQ');
  }

  async publish(queue: string, message: any) {
    await this.channel.assertQueue(queue, { durable: true });
    this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
  }
}
