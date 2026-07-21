import { Body, Controller, Get, Inject, Param, Post, UseGuards } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { lastValueFrom } from "rxjs";
import { JwtUser } from "../auth/jwt-user.interface";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";
import { CurrentUser } from "../common/current-user.decorator";
import { OrderMessages, ORDERS_SERVICE } from "../common/messaging";
import { mapRpcError } from "../common/rpc-errors";
import { Role } from "../common/roles";
import { CreateOrderDto } from "./dto/create-order.dto";

@ApiTags("orders")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("orders")
export class OrdersController {
  constructor(@Inject(ORDERS_SERVICE) private readonly ordersClient: ClientProxy) {}

  @Roles(Role.Buyer)
  @Post()
  create(@Body() dto: CreateOrderDto, @CurrentUser() user: JwtUser) {
    return lastValueFrom(mapRpcError(this.ordersClient.send(OrderMessages.Create, { dto, user })));
  }

  @Roles(Role.Buyer, Role.Admin)
  @Get("my")
  findMine(@CurrentUser() user: JwtUser) {
    return lastValueFrom(mapRpcError(this.ordersClient.send(OrderMessages.FindMine, { user })));
  }

  @Roles(Role.Buyer, Role.Admin)
  @Get(":id")
  findOne(@Param("id") id: string, @CurrentUser() user: JwtUser) {
    return lastValueFrom(mapRpcError(this.ordersClient.send(OrderMessages.FindOne, { id, user })));
  }
}
