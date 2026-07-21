# API Documentation

## Auth

- `POST /auth/register` creates a user.
- `POST /auth/login` returns a JWT access token.
- `GET /auth/me` returns the authenticated user.

Roles are `buyer`, `seller`, and `admin`.

## Products

- `GET /products` lists products.
- `GET /products/:id` returns one product.
- `POST /products` creates a product and requires `seller` or `admin`.
- `PATCH /products/:id` updates a product and requires the owner seller or `admin`.

## Orders

- `POST /orders` creates an order and requires `buyer`.
- `GET /orders/my` lists buyer orders or all orders for `admin`.
- `GET /orders/:id` returns one owned order or any order for `admin`.

Order creation is accepted by the HTTP API and delegated to `orders-service` over Redis transport. The orders service reserves stock inside a PostgreSQL transaction. If stock is not enough, the API returns a client error and does not create the order.

## WebSocket

The API uses Socket.IO.

Connect with:

```json
{
  "auth": {
    "token": "JWT_ACCESS_TOKEN"
  }
}
```

Client event:

- `order.subscribe` with `{ "orderId": "uuid" }`

Server event:

- `order.status.updated` with `{ "orderId": "uuid", "status": "notified" }`
