import { stringify } from "uuid";
import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceUseCase } from "../getBalance/GetBalanceUseCase";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;
let getBalanceUseCase: GetBalanceUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;
let createUserUseCase: CreateUserUseCase;

describe("Create Statement", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository);
    getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementsRepository)
  })

  it("should be able get an Operation Statement", async () => {

    const userDTO: ICreateUserDTO = {
      name: "user",
      email: "test@test.com",
      password: "1234"
    }

    const user = await createUserUseCase.execute(userDTO)

    const statement = await createStatementUseCase.execute({
      user_id: user.id as string,
      description: "Sell Software",
      type: "deposit" as OperationType,
      amount: 140
    })

    const operation = await getStatementOperationUseCase.execute({
      user_id: user.id as string,
      statement_id: statement.id as string
    })

    expect(user).toHaveProperty("id")
    expect(statement).toHaveProperty("id")
    expect(operation).toHaveProperty("id")  
    expect(operation).toEqual(statement)

  })

  it("should not be able get a statement opration from an user not exist", async () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: "fake",
        statement_id: "fake"
      })
    }).rejects.toBeInstanceOf(AppError)
  })

  it("should not be able get a statement opration from a not exist statement", async () => {
    expect(async () => {
      const userDTO: ICreateUserDTO = {
        name: "user",
        email: "test@test.com",
        password: "1234"
      }
      const user = await createUserUseCase.execute(userDTO)
      await getStatementOperationUseCase.execute({
        user_id: user.id as string,
        statement_id: "fake"
      })
    }).rejects.toBeInstanceOf(AppError)
  })

})