import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./auth/auth.module";
import { ORDERS_SERVICE } from "./common/messaging";
import { HealthModule } from "./health/health.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { OrdersController } from "./orders/orders.controller";
import { ProductsModule } from "./products/products.module";
import { User } from "./users/user.entity";
import { Product } from "./products/product.entity";
import { Order } from "./orders/order.entity";
import { OrderItem } from "./orders/order-item.entity";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>("THROTTLE_TTL", 60000),
          limit: config.get<number>("THROTTLE_LIMIT", 30)
        }
      ]
    }),
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
    ClientsModule.registerAsync([
      {
        name: ORDERS_SERVICE,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.REDIS,
          options: {
            host: config.get<string>("REDIS_HOST", "localhost"),
            port: config.get<number>("REDIS_PORT", 6379)
          }
        })
      }
    ]),
    AuthModule,
    HealthModule,
    NotificationsModule,
    ProductsModule
  ],
  controllers: [OrdersController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }]
})
export class AppModule {}
