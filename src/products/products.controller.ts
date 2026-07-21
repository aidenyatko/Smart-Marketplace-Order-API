import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtUser } from "../auth/jwt-user.interface";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";
import { CurrentUser } from "../common/current-user.decorator";
import { Role } from "../common/roles";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ProductsService } from "./products.service";

@ApiTags("products")
@Controller("products")
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  findAll() {
    return this.products.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.products.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Seller, Role.Admin)
  @Post()
  create(@Body() dto: CreateProductDto, @CurrentUser() user: JwtUser) {
    return this.products.create(dto, user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Seller, Role.Admin)
  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateProductDto, @CurrentUser() user: JwtUser) {
    return this.products.update(id, dto, user);
  }
}
