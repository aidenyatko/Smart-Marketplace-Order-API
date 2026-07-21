import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "../products/product.entity";
import { Order } from "./order.entity";

@Entity("order_items")
export class OrderItem {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  orderId: string;

  @ManyToOne(() => Order, (order) => order.items)
  order: Order;

  @Column()
  productId: string;

  @ManyToOne(() => Product)
  product: Product;

  @Column("int")
  quantity: number;

  @Column("int")
  unitPriceCents: number;
}
