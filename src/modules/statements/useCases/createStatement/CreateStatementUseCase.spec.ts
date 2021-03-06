import { create } from "node:domain";
import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { GetBalanceUseCase } from "../getBalance/GetBalanceUseCase";
import { CreateStatementUseCase } from "./CreateStatementUseCase";


let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;
let getBalanceUseCase: GetBalanceUseCase;
let createUserUseCase: CreateUserUseCase;

describe("Create Statement", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    getBalanceUseCase = new GetBalanceUseCase( inMemoryStatementsRepository, inMemoryUsersRepository);
  })


  it("should be able to create a new deposit statement", async () => {
   

    const user = await createUserUseCase.execute({
      name: "user",
      email: "user@email.com",
      password: "1"
    });

    const statement = await createStatementUseCase.execute({
      user_id : user.id as string,
      description: "deposit",
      amount: 50,
      type: OperationType.DEPOSIT
    })


    expect(statement).toHaveProperty("id")
    expect(statement).toHaveProperty("description")
    expect(statement).toHaveProperty("user_id")
    expect(statement.amount).toEqual(50)
    expect(statement.type).toEqual("deposit")
    
  })

  it("should be able to create a new withdraw statement", async () => {
    enum OperationType {
      DEPOSIT = "deposit",
      WITHDRAW = "withdraw"
    };

    const user = await createUserUseCase.execute({
      name: "user",
      email: "user@email.com",
      password: "1"
    });

    const statementDeposit = await createStatementUseCase.execute({
      user_id : user.id as string,
      description: "deposit",
      amount: 89,
      type: "deposit" as OperationType
    })

    const statementWithdraw = await createStatementUseCase.execute({
      user_id : user.id as string,
      description: "withdraw",
      amount: 70,
      type: "withdraw" as OperationType
    })

    const balance = await getBalanceUseCase.execute({user_id: user.id as string})


    expect(statementDeposit.amount).toEqual(89)
    expect(statementWithdraw.amount).toEqual(70)
    expect(balance.balance).toEqual(19)
  
  
  })

  it('should be able to create a new transfer statement ', async () => {
    const user1 = await createUserUseCase.execute({
      name: 'user1',
      email: 'x3@mail.com',
      password: 'user1'
    })

    const user2 = await createUserUseCase.execute({
      name: 'user2',
      email: 'x2@mail.com',
      password: 'user2'
    })


    await createStatementUseCase.execute({
      user_id: user1.id as string,
      description: 'depoist',
      type: OperationType.DEPOSIT,
      amount: 50,
    })

    const transfer = await createStatementUseCase.execute({
      user_id: user2.id as string,
      sender_id: user1.id as string, 
      description: 'transfer to user2',
      type: OperationType.TRANSFER,
      amount: 45
    })

    expect(transfer.amount).toEqual(45)
    expect(transfer.sender_id).toBe(user1.id)
    expect(transfer.user_id).toBe(user2.id)
    
  } )

  it("should not be to create a new statement if user no funds", async () => {
    expect(async () => {
      enum OperationType {
        DEPOSIT = "deposit",
        WITHDRAW = "withdraw"
      };
  
      const user = await createUserUseCase.execute({
        name: "user",
        email: "user@email.com",
        password: "1"
      });
  
      const statementDeposit = await createStatementUseCase.execute({
        user_id : user.id as string,
        description: "deposit",
        amount: 89,
        type: "deposit" as OperationType
      })
  
      const statementWithdraw = await createStatementUseCase.execute({
        user_id : user.id as string,
        description: "withdraw",
        amount: 90,
        type: "withdraw" as OperationType
      })
    }).rejects.toBeInstanceOf(AppError)

  })

  it("should not be to creat if user no-exists", async () => {
    expect(async () => {
      enum OperationType {
        DEPOSIT = "deposit",
        WITHDRAW = "withdraw"
      };
  
      await createStatementUseCase.execute({
        user_id: "unkown",
        description: "user not register",
        amount: 1000,
        type: "deposit" as OperationType
      })
    }).rejects.toBeInstanceOf(AppError)

  })
})