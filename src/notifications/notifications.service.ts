import { Injectable } from "@nestjs/common";
import { OrderStatus } from "../orders/order-status.enum";
import { RedisService } from "./redis.service";

@Injectable()
export class NotificationsService {
  constructor(private readonly redis: RedisService) {}

  async notifyOrderStatus(orderId: string, buyerId: string, status: OrderStatus) {
    await Promise.resolve();
    await this.redis.publish("order.status.updated", { orderId, buyerId, status });
  }
}
