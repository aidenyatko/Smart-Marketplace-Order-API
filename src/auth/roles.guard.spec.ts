import { ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Role } from "../common/roles";
import { ROLES_KEY } from "./roles.decorator";
import { RolesGuard } from "./roles.guard";

describe("RolesGuard", () => {
  const handler = () => undefined;
  const context = (user?: { role: Role }) =>
    ({
      getHandler: () => handler,
      getClass: () => class TestController {},
      switchToHttp: () => ({
        getRequest: () => ({ user })
      })
    }) as unknown as ExecutionContext;

  it("allows users with a required role", () => {
    const reflector = new Reflector();
    Reflect.defineMetadata(ROLES_KEY, [Role.Seller], handler);

    expect(new RolesGuard(reflector).canActivate(context({ role: Role.Seller }))).toBe(true);
  });

  it("rejects users without a required role", () => {
    const reflector = new Reflector();
    Reflect.defineMetadata(ROLES_KEY, [Role.Seller], handler);

    expect(new RolesGuard(reflector).canActivate(context({ role: Role.Buyer }))).toBe(false);
  });
});
