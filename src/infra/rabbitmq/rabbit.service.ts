import * as amqp from 'amqplib';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RabbitService implements OnModuleInit {
  private connection: amqp.ChannelModel;
  private channel: amqp.Channel;

  constructor(private config: ConfigService) {}

  async onModuleInit() {
    this.connection = await amqp.connect(this.config.get('ASYNC_URL'));
    this.channel = await this.connection.createChannel();
  }

  async publish(queue: string, message: any) {
    await this.channel.assertQueue(queue, { durable: true });
    this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
  }
}
