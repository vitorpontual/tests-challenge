import { OperationType, Statement } from "../../entities/Statement";
import { ICreateStatementDTO } from "../../useCases/createStatement/ICreateStatementDTO";
import { IGetBalanceDTO } from "../../useCases/getBalance/IGetBalanceDTO";
import { IGetStatementOperationDTO } from "../../useCases/getStatementOperation/IGetStatementOperationDTO";
import { IStatementsRepository } from "../IStatementsRepository";

export class InMemoryStatementsRepository implements IStatementsRepository {
  private statements: Statement[] = [];


  async create(data: ICreateStatementDTO): Promise<Statement> {
    const statement = new Statement();


    if(data.type === OperationType.TRANSFER){
      const senderTransferStatement = Object.assign(statement, {
        ...data,
        user_id: data.sender_id
      })

      const receiverTransferStatement = Object.assign(statement, {
        ...data,
        user_id: data.user_id,
        sender_id: data.sender_id
      })

      this.statements.push(receiverTransferStatement)
      this.statements.push(senderTransferStatement)

      return senderTransferStatement;
    }

    Object.assign(statement, data);

    this.statements.push(statement);

    return statement;
  }

  async findStatementOperation({ statement_id, user_id }: IGetStatementOperationDTO): Promise<Statement | undefined> {
    return this.statements.find(operation => (
      operation.id === statement_id &&
      operation.user_id === user_id
    ));
  }

  async getUserBalance({ user_id, with_statement = false }: IGetBalanceDTO):
    Promise<
      { balance: number } | { balance: number, statement: Statement[] }
    >
  {
    const statement = this.statements.filter(operation => operation.user_id === user_id);

    const balance = statement.reduce((acc, operation) => {

      if (operation.type === 'deposit') {
        return acc + Number(operation.amount);
      } else if (operation.type === 'withdraw'){
        return acc - Number(operation.amount);
      } else if (operation.type === 'transfer'){
        if(operation.sender_id === user_id){
          return acc - Number(operation.amount);
        }
        return acc + Number(operation.amount);
      }
      
    }, 0)

    if (with_statement) {
      return {
        statement,
        balance
      }
    }

    return { balance }
  }
}
