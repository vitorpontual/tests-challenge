import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceUseCase } from "./GetBalanceUseCase";



let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;
let getBalanceUseCase: GetBalanceUseCase;
let createUserUseCase: CreateUserUseCase;


describe("Get Balance", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    getBalanceUseCase = new GetBalanceUseCase( inMemoryStatementsRepository, inMemoryUsersRepository);
  })

  it("should be able get user balance", async () => {
    enum OperationType {
      DEPOSIT = 'deposit',
      WITHDRAW = 'withdraw',
      TRANSFER = 'transfer'
    }

    const user = await createUserUseCase.execute({
      name: "Brian",
      email: "test@test.com",
      password: "1234"
    })

    await createStatementUseCase.execute({
      user_id: user.id as string,
      description: 'description',
      type: "deposit" as OperationType,
      amount: 100
    })

    const balance = await getBalanceUseCase.execute({
      user_id: user.id as string
    })


    expect(balance).toHaveProperty("balance")
    expect(balance).toHaveProperty("statement")
    expect(balance.balance).toEqual(100)
    expect(balance.statement[0]).toHaveProperty("id")

  })

  it("should not be able to get balance of non user", async () => {
    expect(async () => {
      await getBalanceUseCase.execute({user_id: "0000-1111"})
    }).rejects.toBeInstanceOf(AppError)
    
  })


})