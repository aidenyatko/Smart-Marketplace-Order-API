import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { NotificationsGateway } from "./notifications.gateway";
import { NotificationsService } from "./notifications.service";
import { RedisService } from "./redis.service";

@Module({
  imports: [JwtModule.register({})],
  providers: [NotificationsGateway, NotificationsService, RedisService],
  exports: [NotificationsService, RedisService]
})
export class NotificationsModule {}
