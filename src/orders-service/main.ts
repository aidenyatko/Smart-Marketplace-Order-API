import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { OrdersServiceModule } from "./orders-service.module";

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(OrdersServiceModule);
  const config = app.get(ConfigService);
  await app.close();

  const microservice = await NestFactory.createMicroservice<MicroserviceOptions>(OrdersServiceModule, {
    transport: Transport.REDIS,
    options: {
      host: config.get<string>("REDIS_HOST", "localhost"),
      port: config.get<number>("REDIS_PORT", 6379)
    }
  });

  await microservice.listen();
}

void bootstrap();
