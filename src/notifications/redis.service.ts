import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

@Injectable()
export class RedisService implements OnModuleDestroy {
  readonly client: Redis;
  subscriber?: Redis;

  constructor(config: ConfigService) {
    this.client = new Redis({
      host: config.get<string>("REDIS_HOST", "localhost"),
      port: config.get<number>("REDIS_PORT", 6379),
      lazyConnect: true,
      maxRetriesPerRequest: 1
    });
  }

  async publish(channel: string, payload: unknown) {
    if (this.client.status === "wait") {
      await this.client.connect();
    }
    await this.client.publish(channel, JSON.stringify(payload));
  }

  async ping() {
    if (this.client.status === "wait") {
      await this.client.connect();
    }
    return this.client.ping();
  }

  async onModuleDestroy() {
    this.client.disconnect();
    this.subscriber?.disconnect();
  }
}
