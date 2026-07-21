import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NotificationsModule } from "../notifications/notifications.module";
import { OrderItem } from "./order-item.entity";
import { Order } from "./order.entity";
import { OrdersMicroserviceController } from "./orders.microservice-controller";
import { OrdersService } from "./orders.service";

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem]), NotificationsModule],
  controllers: [OrdersMicroserviceController],
  providers: [OrdersService]
})
export class OrdersModule {}
