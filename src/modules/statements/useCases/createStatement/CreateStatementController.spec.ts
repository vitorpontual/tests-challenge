import { hash } from "bcryptjs";
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

  
    const id = uuidv4()
    const password = await hash('1', 8)

    await connection.query(`
    INSERT INTO users(
      id,
      name,
      email,
      password,
      created_at
      ) VALUES ('bf057822-7e41-4746-8edc-67e3da62cb89', 'admin', 'admin@admin.com','${password}', 'now()')
      `);
  
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
      amount: 100, description: "Sell a Book"
    }).set({
      Authorization: `Bearer ${token}`
    })

    expect(response.body.amount).toEqual(100);
    expect(response.status).toBe(201)
  })

  it("should be able to receive a token, amount and description and withdraw", async () => {
    await request(app).post("/api/v1/users").send({
      name: "user1",
      email: "test@mail.com",
      password: "1234",
    });

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "test@mail.com",
      password: "1234"
    })

    const { token } = responseToken.body

    await request(app).post("/api/v1/statements/deposit").send({
      amount: 29, description: "Buy a toy"
    }).set({
      Authorization: `Bearer ${token}`
    })

    const response = await request(app).post("/api/v1/statements/withdraw").send({
      amount: 28, description: "Buy a toy"
    }).set({
      Authorization: `Bearer ${token}`
    })

    console.log(response.body)
    
    expect(response.body.amount).toEqual(28);
    expect(response.status).toBe(201)
  })

  it("should be able to create a new statement transfer", async () => {

    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'user@mail.com',
      password: '1234'
    })
    
    const { token } = responseToken.body

    const url = `/api/v1/statements/transfer/bf057822-7e41-4746-8edc-67e3da62cb89`

    const response = await request(app).post(url).send({
      amount: 28, description: "transfer money"
    }).set({
      Authorization: `Bearer ${token}`
    })

    console.log(response.body)


    expect(response.status).toBe(201)

  })




})