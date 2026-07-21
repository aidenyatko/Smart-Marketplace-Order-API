import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { OrderStatus } from "../orders/order-status.enum";
import { RedisService } from "./redis.service";

@WebSocketGateway({ cors: true })
export class NotificationsGateway implements OnModuleInit, OnModuleDestroy {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly redis: RedisService
  ) {}

  async onModuleInit() {
    const subscriber = this.redis.client.duplicate();
    this.redis.subscriber = subscriber;
    await subscriber.connect();
    await subscriber.subscribe("order.status.updated");
    subscriber.on("message", (_channel, message) => {
      const payload = JSON.parse(message) as { orderId: string; buyerId: string; status: OrderStatus };
      this.emitOrderStatus(payload.orderId, payload.buyerId, payload.status);
    });
  }

  onModuleDestroy() {
    this.redis.subscriber?.disconnect();
  }

  handleConnection(client: Socket) {
    const token = client.handshake.auth?.token;
    try {
      const payload = this.jwt.verify(token, {
        secret: this.config.get<string>("JWT_SECRET", "change-me-in-local-dev")
      });
      client.data.user = payload;
      client.join(`user:${payload.sub}`);
    } catch {
      client.disconnect();
    }
  }

  @SubscribeMessage("order.subscribe")
  subscribe(@ConnectedSocket() client: Socket, @MessageBody() body: { orderId: string }) {
    client.join(`order:${body.orderId}`);
    return { event: "order.subscribed", orderId: body.orderId };
  }

  emitOrderStatus(orderId: string, buyerId: string, status: OrderStatus) {
    const payload = { orderId, status };
    this.server.to(`user:${buyerId}`).to(`order:${orderId}`).emit("order.status.updated", payload);
  }
}
