import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { JwtUser } from "../auth/jwt-user.interface";
import { OrderMessages } from "../common/messaging";
import { toRpcException } from "../common/rpc-errors";
import { CreateOrderDto } from "./dto/create-order.dto";
import { OrdersService } from "./orders.service";

@Controller()
export class OrdersMicroserviceController {
  constructor(private readonly orders: OrdersService) {}

  @MessagePattern(OrderMessages.Create)
  async create(@Payload() payload: { dto: CreateOrderDto; user: JwtUser }) {
    try {
      return await this.orders.create(payload.dto, payload.user);
    } catch (error) {
      toRpcException(error);
    }
  }

  @MessagePattern(OrderMessages.FindMine)
  async findMine(@Payload() payload: { user: JwtUser }) {
    try {
      return await this.orders.findMine(payload.user);
    } catch (error) {
      toRpcException(error);
    }
  }

  @MessagePattern(OrderMessages.FindOne)
  async findOne(@Payload() payload: { id: string; user: JwtUser }) {
    try {
      return await this.orders.findOne(payload.id, payload.user);
    } catch (error) {
      toRpcException(error);
    }
  }
}
