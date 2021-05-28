import { OperationType } from '../../entities/Statement';
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { GetStatementOperationUseCase } from './GetStatementOperationUseCase';
import { GetStatementOperationError } from './GetStatementOperationError';

let getStatementOperationUseCase: GetStatementOperationUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;
let statementsRepositoryInMemory: InMemoryStatementsRepository;

describe('Get Statement Operation Use Case', () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory,
    );
  });

  it('should be able to get a statement operation for a given user', async () => {
    // Cria um usuário
    const user = {
      name: 'John Doe',
      email: 'john.doe@foo.com',
      password: 'any'
    }
    const createdUser = await usersRepositoryInMemory.create(user);
    // Cria uma movimentação para o usuário
    const deposit = {
      user_id: createdUser.id!,
      description: 'deposit',
      amount: 33.00,
      type: OperationType.DEPOSIT,
    };
    const statement = await statementsRepositoryInMemory.create(deposit);
    // Consulta a operação
    const statementOperation = await getStatementOperationUseCase.execute({
      user_id: createdUser.id!,
      statement_id: statement.id!,
    });

    expect(Number(statementOperation.amount)).toBe(33.00);
    expect(statementOperation.type).toBe(OperationType.DEPOSIT);
  });

  it('should not be able to get a statement operation for a non existing user', async () => {
    // Cria um usuário
    const user = {
      name: 'John Doe',
      email: 'john.doe@foo.com',
      password: 'any'
    }
    const createdUser = await usersRepositoryInMemory.create(user);
    // Cria uma movimentação para o usuário
    const deposit = {
      user_id: createdUser.id!,
      description: 'deposit',
      amount: 66.00,
      type: OperationType.DEPOSIT,
    };
    const statement = await statementsRepositoryInMemory.create(deposit);

    // Tenta consultar a operação, passando um id de usuário não existente
    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: 'non-existent',
        statement_id: statement.id!,
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it('should not be able to get a non existent statement operation', async () => {
    // Cria um usuário
    const user = {
      name: 'John Doe',
      email: 'john.doe@foo.com',
      password: 'any'
    }
    const createdUser = await usersRepositoryInMemory.create(user);

    // Tenta consultar uma operação, passando um id de movimentação não existente
    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: createdUser.id!,
        statement_id: 'non-existent',
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
