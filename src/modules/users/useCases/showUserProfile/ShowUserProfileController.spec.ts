import { hash } from "bcryptjs"
import  request  from "supertest"
import { Connection, createConnection } from "typeorm"
import { v4 as uuid} from "uuid"
import { app } from "../../../../app"


let connection: Connection

describe("Show User", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
    console.log("migration Show")
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it("should be able show user profile", async () => {
    await request(app).post("/api/v1/users/").send({
      name: "User Test",
      email: "test2@test.com",
      password: "admin",
    });

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "test2@test.com",
      password: "admin"
    })

    const { token, user } = responseToken.body
    const { id } = user

    const response = await request(app).get("/api/v1/profile").send({id}).set({
      Authorization: `Bearer ${token}`
    })

    expect(response.status).toBe(200)
  })

  it("should not be able to receive a token and return nonexistent user", async () => {
    await request(app).post("/api/v1/users/").send({
      name: "User Test",
      email: "general@email.com",
      password: "admin",
    });

    const id = uuid();
    const response = await request(app).get("/api/v1/profile").send({id}).set({
      Authorization: `Bearer invalidToken`
    })


    expect(response.status).toBe(401)
  })

  
})