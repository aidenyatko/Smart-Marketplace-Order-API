import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { JwtUser } from "../auth/jwt-user.interface";
import { OrderMessages } from "../common/messaging";
import { CreateOrderDto } from "./dto/create-order.dto";
import { OrdersService } from "./orders.service";

@Controller()
export class OrdersMicroserviceController {
  constructor(private readonly orders: OrdersService) {}

  @MessagePattern(OrderMessages.Create)
  create(@Payload() payload: { dto: CreateOrderDto; user: JwtUser }) {
    return this.orders.create(payload.dto, payload.user);
  }

  @MessagePattern(OrderMessages.FindMine)
  findMine(@Payload() payload: { user: JwtUser }) {
    return this.orders.findMine(payload.user);
  }

  @MessagePattern(OrderMessages.FindOne)
  findOne(@Payload() payload: { id: string; user: JwtUser }) {
    return this.orders.findOne(payload.id, payload.user);
  }
}
