import { HttpException, InternalServerErrorException } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { catchError, Observable, throwError } from "rxjs";

interface RpcErrorPayload {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export function toRpcException(error: unknown): never {
  if (error instanceof HttpException) {
    const response = error.getResponse();
    const payload =
      typeof response === "object" && response !== null
        ? (response as RpcErrorPayload)
        : { statusCode: error.getStatus(), message: String(response), error: error.name };

    throw new RpcException({
      statusCode: payload.statusCode ?? error.getStatus(),
      message: payload.message ?? error.message,
      error: payload.error ?? error.name
    });
  }

  throw new RpcException({
    statusCode: 500,
    message: "Internal service error",
    error: "InternalServerError"
  });
}

export function mapRpcError<T>(source: Observable<T>): Observable<T> {
  return source.pipe(
    catchError((error: unknown) => {
      const payload = readRpcPayload(error);
      return throwError(() => new HttpException({ message: payload.message, error: payload.error }, payload.statusCode));
    })
  );
}

function readRpcPayload(error: unknown): RpcErrorPayload {
  if (typeof error === "object" && error !== null) {
    const payload = error as Partial<RpcErrorPayload>;
    if (typeof payload.statusCode === "number" && payload.message) {
      return {
        statusCode: payload.statusCode,
        message: payload.message,
        error: payload.error
      };
    }
  }

  const fallback = new InternalServerErrorException("Orders service is unavailable");
  return {
    statusCode: fallback.getStatus(),
    message: fallback.message,
    error: fallback.name
  };
}
