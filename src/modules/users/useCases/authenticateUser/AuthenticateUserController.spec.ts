import { hash } from "bcryptjs"
import  request  from "supertest"
import { Connection } from "typeorm"

import { v4 as uuid} from "uuid"
import { app } from "../../../../app"
import  createConnection  from "../../../../database/index"


let connection: Connection

describe("Authentication", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
    console.log("migration auth")
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it("should be able to authenticate session and return user ", async () => {
    await request(app).post("/api/v1/users/").send({
      name: "User Test",
      email: "test1@test.com",
      password: "admin",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "test1@test.com",
      password: "admin"
    })

    const { token } = response.body

    expect(response.body).toHaveProperty("token")
    expect(response.body).toHaveProperty("user")
    expect(response.status).toBe(200)


  })

  it("should not be able to authenticate user not exists", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "test@test.com",
      password: "unkown"
    })

    expect(response.status).toBe(401)
  })
})