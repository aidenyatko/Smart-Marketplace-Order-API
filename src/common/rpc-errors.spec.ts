import { BadRequestException, HttpException } from "@nestjs/common";
import { lastValueFrom, throwError } from "rxjs";
import { mapRpcError, toRpcException } from "./rpc-errors";

describe("rpc error mapping", () => {
  it("keeps http status and message when converting to rpc error", () => {
    try {
      toRpcException(new BadRequestException("Invalid order"));
    } catch (error) {
      expect(error).toMatchObject({
        error: {
          statusCode: 400,
          message: "Invalid order"
        }
      });
    }
  });

  it("maps rpc payload back to http exception", async () => {
    await expect(
      lastValueFrom(mapRpcError(throwError(() => ({ statusCode: 404, message: "Order not found", error: "NotFound" }))))
    ).rejects.toBeInstanceOf(HttpException);
  });
});
