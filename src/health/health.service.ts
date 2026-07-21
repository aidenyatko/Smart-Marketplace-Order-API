import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { RedisService } from "../notifications/redis.service";

@Injectable()
export class HealthService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly redis: RedisService
  ) {}

  async check() {
    await this.dataSource.query("select 1");
    const redis = await this.redis.ping();
    return { status: "ok", database: "ready", redis };
  }
}
