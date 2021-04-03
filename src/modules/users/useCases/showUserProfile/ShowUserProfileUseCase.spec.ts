import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase"


let inMemoryUserRepository: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;
let createUserUseCase: CreateUserUseCase;

describe("Show User Profile", () => {
  beforeEach(() => {
        inMemoryUserRepository = new InMemoryUsersRepository();
        showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUserRepository);
        createUserUseCase = new CreateUserUseCase(inMemoryUserRepository);

        

  })

  it("should be able show User Profile", async () => {
    const createUser = await createUserUseCase.execute({
      name: "test",
      email: "malboro@test.com",
      password: "password"
    })

    const user = await showUserProfileUseCase.execute(createUser.id as string)

    expect(createUser).toEqual(user)

  })

  it("should not be able to show user profile of a non exist user", async () => {
    expect(async () => {
      const user = {
        id: "1234",
        name: "test",
        email: "test@test.com",
        password: "test"
      };
  
      await showUserProfileUseCase.execute(user.id);
    }).rejects.toBeInstanceOf(AppError)
  })
})