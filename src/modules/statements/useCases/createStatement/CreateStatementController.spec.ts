import { response } from "express";
import request from "supertest";
import { Connection } from "typeorm";
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

  it("should be able to receive a token, amount and description and deposit", async () => {
    await request(app).post("/api/v1/users").send({
      name: "user1",
      email: "user@mail.com",
      password: "1234",
    });

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "user@mail.com",
      password: "1234"
    })

    const { token } = responseToken.body

    const response = await request(app).post("/api/v1/statements/deposit").send({
      amount: 29, description: "Sell a Book"
    }).set({
      Authorization: `Bearer ${token}`
    })

    expect(response.body.amount).toEqual(29);
    expect(response.status).toBe(201)
  })

  it("should be able to receive a token, amount and description and withdraw", async () => {
    await request(app).post("/api/v1/users").send({
      name: "user1",
      email: "user@mail.com",
      password: "1234",
    });

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "user@mail.com",
      password: "1234"
    })

    const { token } = responseToken.body

    const response = await request(app).post("/api/v1/statements/withdraw").send({
      amount: 28, description: "Buy a toy"
    }).set({
      Authorization: `Bearer ${token}`
    })
    
    expect(response.body.amount).toEqual(28);
    expect(response.status).toBe(201)
  })




})