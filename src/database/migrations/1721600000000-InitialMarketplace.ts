import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMarketplace1721600000000 implements MigrationInterface {
  name = "InitialMarketplace1721600000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('buyer', 'seller', 'admin')`);
    await queryRunner.query(`CREATE TYPE "public"."orders_status_enum" AS ENUM('created', 'reserved', 'notified', 'failed')`);
    await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "passwordHash" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_users_email" UNIQUE ("email"), CONSTRAINT "PK_users" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text NOT NULL, "priceCents" integer NOT NULL, "stock" integer NOT NULL, "sellerId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_products" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "buyerId" uuid NOT NULL, "status" "public"."orders_status_enum" NOT NULL DEFAULT 'created', "totalCents" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_orders" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "order_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "orderId" uuid NOT NULL, "productId" uuid NOT NULL, "quantity" integer NOT NULL, "unitPriceCents" integer NOT NULL, CONSTRAINT "PK_order_items" PRIMARY KEY ("id"))`);
    await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_products_seller" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_orders_buyer" FOREIGN KEY ("buyerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_order_items_order" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_order_items_product" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_order_items_product"`);
    await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_order_items_order"`);
    await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_orders_buyer"`);
    await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_products_seller"`);
    await queryRunner.query(`DROP TABLE "order_items"`);
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
  }
}
