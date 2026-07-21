import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, In, Repository } from "typeorm";
import { JwtUser } from "../auth/jwt-user.interface";
import { Role } from "../common/roles";
import { NotificationsService } from "../notifications/notifications.service";
import { Product } from "../products/product.entity";
import { CreateOrderDto } from "./dto/create-order.dto";
import { OrderItem } from "./order-item.entity";
import { OrderStatus } from "./order-status.enum";
import { Order } from "./order.entity";

@Injectable()
export class OrdersService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    private readonly notifications: NotificationsService
  ) {}

  async create(dto: CreateOrderDto, user: JwtUser) {
    const order = await this.dataSource.transaction(async (manager) => {
      const productIds = dto.items.map((item) => item.productId);
      if (new Set(productIds).size !== productIds.length) {
        throw new BadRequestException("Duplicate products are not allowed in one order");
      }

      const products = await manager
        .getRepository(Product)
        .createQueryBuilder("product")
        .setLock("pessimistic_write")
        .where({ id: In(productIds) })
        .getMany();

      if (products.length !== dto.items.length) {
        throw new NotFoundException("One or more products were not found");
      }

      const productById = new Map(products.map((product) => [product.id, product]));
      let totalCents = 0;

      for (const item of dto.items) {
        const product = productById.get(item.productId);
        if (!product) {
          throw new NotFoundException("Product not found");
        }
        if (product.stock < item.quantity) {
          throw new BadRequestException(`Insufficient stock for product ${product.id}`);
        }

        product.stock -= item.quantity;
        totalCents += product.priceCents * item.quantity;
        await manager.save(product);
      }

      const savedOrder = await manager.save(
        manager.create(Order, {
          buyerId: user.sub,
          status: OrderStatus.Reserved,
          totalCents
        })
      );

      const orderItems = dto.items.map((item) => {
        const product = productById.get(item.productId);
        if (!product) {
          throw new NotFoundException("Product not found");
        }
        return manager.create(OrderItem, {
          orderId: savedOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPriceCents: product.priceCents
        });
      });

      await manager.save(orderItems);
      return manager.findOneOrFail(Order, { where: { id: savedOrder.id }, relations: { items: true } });
    });

    void this.notifications.notifyOrderStatus(order.id, order.buyerId, OrderStatus.Notified);
    return order;
  }

  findMine(user: JwtUser) {
    if (user.role === Role.Admin) {
      return this.orders.find({ relations: { items: true }, order: { createdAt: "DESC" } });
    }

    return this.orders.find({
      where: { buyerId: user.sub },
      relations: { items: true },
      order: { createdAt: "DESC" }
    });
  }

  async findOne(id: string, user: JwtUser) {
    const order = await this.orders.findOne({ where: { id }, relations: { items: true } });
    if (!order) {
      throw new NotFoundException("Order not found");
    }
    if (user.role !== Role.Admin && order.buyerId !== user.sub) {
      throw new ForbiddenException("You can only view your own orders");
    }
    return order;
  }
}
