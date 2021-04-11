import request from "supertest";
import { Connection, UsingJoinColumnOnlyOnOneSideAllowedError } from "typeorm";
import { v4 as uuidv4 } from "uuid";

import { app } from "../../../../app";
import createConnection from "../../../../database/index";

let connection: Connection;

describe("Statements", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to receive a token an get balance", async () => {
    await request(app).post("/api/v1/users/").send({
      name: "user",
      email: "user@mail.com",
      password: "1234"
    })

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "user@mail.com",
      password: "1234"
    })

    const { token } = responseToken.body;

    await request(app)
      .post("/api/v1/statements/deposit")
      .send({ amount: 100, description: "deposit" })
      .set({ Authorization: `Bearer ${token}` });

    await request(app)
      .post("/api/v1/statements/withdraw")
      .send({ amount: 50, description: "withdraw" })
      .set({ Authorization: `Bearer ${token}` });

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({ Authorization: `Bearer ${token}` });

    expect(response.body.balance).toEqual(50)
    expect(response.status).toBe(200)
  })




});