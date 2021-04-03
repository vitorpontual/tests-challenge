import { hash } from "bcryptjs"
import  request  from "supertest"
import { Connection } from "typeorm"
import { v4 as uuid} from "uuid"
import { app } from "../../../../app"

import  createConnection  from "../../../../database/index"



let connection: Connection

describe("Create User", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
    console.log("migration create")
    
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })


  it("should be able to create a new user", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "james",
      email: "aloprado@email.com",
      password: "1234"
    })


    expect(response.status).toBe(201)
  })
  it("should not be able to create a new user if already exists", async () => {
    const user1 = await request(app).post("/api/v1/users").send({
      name: "Brian",
      email: "brian@test.com",
      password: "1234"
    })

    const user2 = await request(app).post("/api/v1/users").send({
      name: "Brian",
      email: "brian@test.com",
      password: "1234"
    })

    expect(user2.status).toBe(400)

   

  })
  
})