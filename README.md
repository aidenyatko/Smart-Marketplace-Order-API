# Smart Marketplace Order API

MVP microservice backend for a small marketplace. A seller creates a product, a buyer creates an order through the HTTP API, a separate orders service reserves stock in PostgreSQL, and the buyer receives an order status update through WebSocket.

## Stack

- TypeScript, NestJS, PostgreSQL, Redis
- JWT authentication, RBAC for `buyer`, `seller`, `admin`
- DTO validation, guards, pipes, Swagger
- TypeORM migrations and parameterized queries
- Docker Compose

## Services

- `app`: HTTP API, Swagger, JWT/RBAC, products, WebSocket gateway.
- `orders-service`: Redis microservice that owns order creation and stock reservation.
- `postgres`: durable storage.
- `redis`: microservice transport and notification event channel.

## Run

```powershell
npm.cmd install
npm.cmd run build
$env:DOCKER_CONFIG = (Resolve-Path .docker).Path
docker compose down -v
docker compose up -d --build
```

Swagger is available at `http://localhost:3000/docs`.
Health check is available at `http://localhost:3000/health`.

Docker builds use `.dockerignore` so local dependencies, Git metadata, caches, and generated artifacts do not enter the image build context.

## Automated Checks

```powershell
npm.cmd run lint
npm.cmd test -- --runInBand
npm.cmd run build
npm.cmd run test:e2e
```

RBAC tests cover role guard behavior and product ownership rules.

## Manual MVP Scenario

1. Register a seller with `POST /auth/register`.
2. Login as seller with `POST /auth/login`.
3. Create a product with `POST /products` using the seller bearer token.
4. Register and login a buyer.
5. Connect a Socket.IO client with `auth.token` set to the buyer JWT.
6. Create an order with `POST /orders` using the buyer bearer token.
7. Confirm the product stock decreases and `order.status.updated` is emitted.

The WebSocket gateway listens to Redis order events and forwards them to the authenticated buyer room.

## GitFlow

- `main` contains stable reviewed code.
- `develop` receives completed feature branches.
- Each feature branch must pass automated tests before commit. Manual Docker/API checks run at the end of the branch.
