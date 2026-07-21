import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrderItem } from "../orders/order-item.entity";
import { Order } from "../orders/order.entity";
import { OrdersModule } from "../orders/orders.module";
import { Product } from "../products/product.entity";
import { User } from "../users/user.entity";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: "postgres",
        host: config.get<string>("DATABASE_HOST", "localhost"),
        port: config.get<number>("DATABASE_PORT", 5432),
        username: config.get<string>("DATABASE_USER", "app_user"),
        password: config.get<string>("DATABASE_PASSWORD", "app_password"),
        database: config.get<string>("DATABASE_NAME", "app_db"),
        entities: [User, Product, Order, OrderItem],
        synchronize: false
      })
    }),
    OrdersModule
  ]
})
export class OrdersServiceModule {}
