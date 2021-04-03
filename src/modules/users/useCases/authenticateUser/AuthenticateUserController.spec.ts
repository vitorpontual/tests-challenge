import { hash } from "bcryptjs"
import  request  from "supertest"
import { Connection, createConnection } from "typeorm"
import { v4 as uuid} from "uuid"
import { app } from "../../../../app"


let connection: Connection

describe("Authentication", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuid();

    const password = await hash("admin", 8);

    await connection.query(`
    INSERT INTO users(
      id,
      name,
      password,
      email,
      created_at
      ) VALUES ('${id}', 'admin', '${password}', 'admin@admin.com', 'now()')
      `);

  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it("should be able to authenticate session and return user ", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "admin@admin.com",
      password: "admin"
    })

    const { token } = response.body

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty("token")
    expect(response.body).toHaveProperty("user")


  })

  it("should not be able to authenticate user not exists", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "unkown",
      passowrd: "unkown"
    })

    expect(response.status).toBe(401)
  })
})