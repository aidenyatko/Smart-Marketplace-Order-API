import "reflect-metadata";
import { join } from "path";
import { DataSource } from "typeorm";
import { OrderItem } from "../orders/order-item.entity";
import { Order } from "../orders/order.entity";
import { Product } from "../products/product.entity";
import { User } from "../users/user.entity";

export default new DataSource({
  type: "postgres",
  host: process.env.DATABASE_HOST ?? "localhost",
  port: Number(process.env.DATABASE_PORT ?? 5432),
  username: process.env.DATABASE_USER ?? "app_user",
  password: process.env.DATABASE_PASSWORD ?? "app_password",
  database: process.env.DATABASE_NAME ?? "app_db",
  entities: [User, Product, Order, OrderItem],
  migrations: [join(__dirname, "migrations/*{.ts,.js}")]
});
