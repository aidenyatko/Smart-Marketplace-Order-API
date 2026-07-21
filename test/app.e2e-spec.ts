import { Controller, Get, INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from "supertest";
import { configureApp } from "../src/app.bootstrap";

@Controller("health")
class TestHealthController {
  @Get()
  check() {
    return { status: "ok" };
  }
}

describe("App bootstrap", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TestHealthController]
    }).compile();

    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("serves health route with configured pipes and swagger bootstrap", async () => {
    await request(app.getHttpServer()).get("/health").expect(200).expect({ status: "ok" });
  });
});
