import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { JwtUser } from "../auth/jwt-user.interface";

export const CurrentUser = createParamDecorator((_: unknown, context: ExecutionContext): JwtUser => {
  return context.switchToHttp().getRequest<{ user: JwtUser }>().user;
});
