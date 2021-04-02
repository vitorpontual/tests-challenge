import { compare } from "bcryptjs";
import  request from "supertest"

import { app } from "../../../../app";
import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "./CreateUserUseCase";

let inMemoryUserRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create User", () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUserRepository)
  });

  it("should be able create a new user", async () => {
    const user = await createUserUseCase.execute({
      name: "test",
      email: "test@test.com",
      password: "1234"
    })

    expect(user).toHaveProperty("id")
    expect(compare(user.password, "1234")).toBeTruthy()
    

    expect(201)
  })

  it("should not be able to create a user with an already email exists", () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "test",
        email: "test@test.com",
        password: "123"
      })

      await createUserUseCase.execute({
        name: "test",
        email: "test@test.com",
        password: "123"
      })

    }).rejects.toBeInstanceOf(AppError)

  })
})