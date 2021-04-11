import { inject, injectable } from "tsyringe";
import { SimpleConsoleLogger } from "typeorm";

import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType } from "../../entities/Statement";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

@injectable()
export class CreateStatementUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({ user_id, sender_id, type, amount, description }: ICreateStatementDTO) {
    const user = await this.usersRepository.findById(user_id);

    if (!user){
      throw new CreateStatementError.UserNotFound();
    }

    const receiver = await this.usersRepository.findById(sender_id as string)
    
    if (!receiver && type === OperationType.TRANSFER){
      throw new CreateStatementError.UserNotFound();
    }

    if(receiver && type === OperationType.TRANSFER){
      const { balance } = await this.statementsRepository.getUserBalance({ user_id: sender_id as string})
      
      if( balance < amount){
        throw new CreateStatementError.InsufficientFunds
      } 
    }

    if (type === OperationType.WITHDRAW){
      const { balance } = await this.statementsRepository.getUserBalance({ user_id})
      
      if( balance < amount){
        throw new CreateStatementError.InsufficientFunds
      }
    }

    
    const statementOperation = await this.statementsRepository.create({
      user_id,
      sender_id,
      type,
      amount,
      description
    });


    return statementOperation;
  }
}
