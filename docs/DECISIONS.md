# Decisions

## Microservice Split

The MVP uses a small microservice split. The `app` service owns HTTP, Swagger, auth, products, and WebSocket connections. The `orders-service` owns order creation and stock reservation. Redis is the transport between them.

## PostgreSQL For Order Consistency

Orders and stock live in PostgreSQL. Stock reservation happens in a transaction with row locking, so two buyers cannot safely reserve the same last item at the same time.

## Redis For Async Integration

Redis is used as the NestJS microservice transport and as the order notification channel. The orders service publishes order status events, and the API WebSocket gateway forwards them to connected clients.

## Error Mapping Across Services

The orders service converts domain HTTP exceptions into RPC payloads. The API converts those payloads back into HTTP responses, so clients receive stable status codes even though order work runs in a separate service.

## JWT And RBAC

JWT keeps the API stateless. RBAC is intentionally simple: buyers place orders, sellers manage products, and admins can inspect or update broader data.

## MVP Boundaries

The MVP excludes payments, delivery, refunds, refresh token rotation, and a frontend. These features would add product scope without improving the core backend signal for this project.

## Testing Discipline

Each feature branch is validated with lint, unit tests, build, e2e smoke tests, and a clean Docker run. Manual checks are run at the end of each branch so the branch is tested from a fresh PostgreSQL volume.
