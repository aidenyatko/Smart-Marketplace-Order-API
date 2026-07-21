import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Role } from "../common/roles";
import { JwtUser } from "../auth/jwt-user.interface";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { Product } from "./product.entity";

@Injectable()
export class ProductsService {
  constructor(@InjectRepository(Product) private readonly products: Repository<Product>) {}

  create(dto: CreateProductDto, user: JwtUser) {
    return this.products.save(this.products.create({ ...dto, sellerId: user.sub }));
  }

  findAll() {
    return this.products.find({ order: { createdAt: "DESC" } });
  }

  async findOne(id: string) {
    const product = await this.products.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException("Product not found");
    }
    return product;
  }

  async update(id: string, dto: UpdateProductDto, user: JwtUser) {
    const product = await this.findOne(id);
    if (user.role !== Role.Admin && product.sellerId !== user.sub) {
      throw new ForbiddenException("Only the owner seller or admin can update this product");
    }

    Object.assign(product, dto);
    return this.products.save(product);
  }
}
