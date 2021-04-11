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

  it("should be able to receive a token, a statement id and return the statement selected", async () => {
    await request(app).post("/api/v1/users/").send({
      name: "User4",
      email: "test4@email.com",
      password: "admin",
    });

    const responseToken = await request(app).post("/api/v1/sessions/").send({
      email: "test4@email.com",
      password: "admin",
    });

    const { token } = responseToken.body;

    const responseStatement = await request(app).post("/api/v1/statements/deposit").send({
      amount: 100, description: "Sell a book"
    })
    .set({ Authorization: `Bearer ${token}`})

    const { id } = responseStatement.body

    const url = `/api/v1/statements/${id}`

    const response = await request(app).post(url).set({ Authorization: `Bearer ${token}`})


    
    expect(response.body.amount).toBe("100.00")
    expect(response.status).toBe(200)
  })

})