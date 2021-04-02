import { compare } from "bcryptjs";
import  request from "supertest"

import { app } from "../../../../app";
import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";

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

    console.log(auth)
  })

})