import { NotificationsGateway } from "./notifications.gateway";

describe("NotificationsGateway", () => {
  it("emits order status to buyer and order rooms", () => {
    const emit = jest.fn();
    const toOrder = jest.fn().mockReturnValue({ emit });
    const toUser = jest.fn().mockReturnValue({ to: toOrder });
    const gateway = new NotificationsGateway({} as never, {} as never, {} as never);
    gateway.server = { to: toUser } as never;

    gateway.emitOrderStatus("order-id", "buyer-id", "notified" as never);

    expect(toUser).toHaveBeenCalledWith("user:buyer-id");
    expect(toOrder).toHaveBeenCalledWith("order:order-id");
    expect(emit).toHaveBeenCalledWith("order.status.updated", { orderId: "order-id", status: "notified" });
  });
});
