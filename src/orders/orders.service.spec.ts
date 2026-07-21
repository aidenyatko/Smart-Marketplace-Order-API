import { BadRequestException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { Role } from "../common/roles";
import { NotificationsService } from "../notifications/notifications.service";
import { Product } from "../products/product.entity";
import { OrderStatus } from "./order-status.enum";
import { Order } from "./order.entity";
import { OrdersService } from "./orders.service";

describe("OrdersService", () => {
  const user = { sub: "buyer-id", email: "buyer@example.com", role: Role.Buyer };
  const notifyOrderStatus = jest.fn();

  function createService(product: Product) {
    const manager = {
      getRepository: jest.fn().mockReturnValue({
        createQueryBuilder: jest.fn().mockReturnValue({
          setLock: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getMany: jest.fn().mockResolvedValue([product])
        })
      }),
      save: jest.fn().mockImplementation(async (value) => {
        if (Array.isArray(value)) {
          return value;
        }
        if (value instanceof Order || value.buyerId) {
          return { ...value, id: "order-id" };
        }
        return value;
      }),
      create: jest.fn().mockImplementation((_: unknown, value: unknown) => value),
      findOneOrFail: jest.fn().mockResolvedValue({
        id: "order-id",
        buyerId: user.sub,
        status: OrderStatus.Reserved,
        totalCents: 2000,
        items: []
      })
    };

    const dataSource = {
      transaction: jest.fn((callback) => callback(manager))
    };

    return Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: DataSource, useValue: dataSource },
        { provide: getRepositoryToken(Order), useValue: { find: jest.fn(), findOne: jest.fn() } },
        { provide: NotificationsService, useValue: { notifyOrderStatus } }
      ]
    }).compile();
  }

  beforeEach(() => notifyOrderStatus.mockClear());

  it("reserves stock and sends async notification", async () => {
    const product = { id: "product-id", stock: 3, priceCents: 1000 } as Product;
    const module = await createService(product);
    const service = module.get(OrdersService);

    const result = await service.create({ items: [{ productId: "product-id", quantity: 2 }] }, user);

    expect(result.status).toBe(OrderStatus.Reserved);
    expect(product.stock).toBe(1);
    expect(notifyOrderStatus).toHaveBeenCalledWith("order-id", "buyer-id", OrderStatus.Notified);
  });

  it("rejects orders when stock is not enough", async () => {
    const product = { id: "product-id", stock: 1, priceCents: 1000 } as Product;
    const module = await createService(product);
    const service = module.get(OrdersService);

    await expect(service.create({ items: [{ productId: "product-id", quantity: 2 }] }, user)).rejects.toBeInstanceOf(
      BadRequestException
    );
  });
});
