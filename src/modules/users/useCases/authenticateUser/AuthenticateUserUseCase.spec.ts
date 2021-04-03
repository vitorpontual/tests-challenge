import { compare } from "bcryptjs";
import request from "supertest"

import { app } from "../../../../app";
import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let inMemoryUserRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;

describe("Create User", () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUserRepository)
    createUserUseCase = new CreateUserUseCase(inMemoryUserRepository)

  });

  it("should be able authenticate user!", async () => {
    const user = await createUserUseCase.execute({
      name: "test",
      email: "test@test.com",
      password: "1234"
    })

    const auth = await authenticateUserUseCase.execute({
      email: "test@test.com",
      password: "1234"
    })

    expect(auth.user).toHaveProperty("id")
    expect(auth).toHaveProperty("token")
    expect(auth.user.email).toEqual("test@test.com")
    expect(auth.token).not.toBeNull()
  })

  it("should not be able to authenticate a no exist user", async () => {
    expect(async () => {
      const notUser: ICreateUserDTO = {
        name: "unkown",
        email: "not@have.com",
        password: "none"
      };

      await authenticateUserUseCase.execute({
        email: notUser.email,
        password: notUser.password
      })
    }).rejects.toBeInstanceOf(AppError)

  })

})