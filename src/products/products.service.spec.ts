import { ForbiddenException } from "@nestjs/common";
import { Role } from "../common/roles";
import { Product } from "./product.entity";
import { ProductsService } from "./products.service";

describe("ProductsService", () => {
  const product = {
    id: "product-id",
    sellerId: "seller-id",
    name: "Keyboard",
    description: "Office keyboard",
    priceCents: 5000,
    stock: 5
  } as Product;

  function service() {
    const repository = {
      findOne: jest.fn().mockResolvedValue({ ...product }),
      save: jest.fn().mockImplementation((value) => Promise.resolve(value)),
      create: jest.fn().mockImplementation((value) => value),
      find: jest.fn()
    };

    return {
      service: new ProductsService(repository as never),
      repository
    };
  }

  it("allows admin to update another seller product", async () => {
    const { service: products } = service();

    const result = await products.update(
      product.id,
      { stock: 10 },
      { sub: "admin-id", email: "admin@example.com", role: Role.Admin }
    );

    expect(result.stock).toBe(10);
  });

  it("rejects seller updating another seller product", async () => {
    const { service: products } = service();

    await expect(
      products.update(product.id, { stock: 10 }, { sub: "other-seller", email: "seller@example.com", role: Role.Seller })
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
