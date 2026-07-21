import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "../users/user.entity";
import { OrderItem } from "./order-item.entity";
import { OrderStatus } from "./order-status.enum";

@Entity("orders")
export class Order {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  buyerId: string;

  @ManyToOne(() => User)
  buyer: User;

  @Column({ type: "enum", enum: OrderStatus, default: OrderStatus.Created })
  status: OrderStatus;

  @Column("int")
  totalCents: number;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
