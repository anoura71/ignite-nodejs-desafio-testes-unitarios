import { hash } from 'bcryptjs';
import request from 'supertest';
import { Connection, createConnection } from 'typeorm';
import { v4 as uuidV4 } from 'uuid';

import { app } from '../../../../app';

let connection: Connection;

const USER_NAME = 'Test User';
const USER_EMAIL = 'user@fin.com';
const USER_PASSWORD = 'any';

describe('Get Balance Controller', () => {
  beforeAll(async () => {
    // Conecta com o BD
    connection = await createConnection();
    // Cria a estrutura do BD através das migrations
    await connection.runMigrations();

    // Cria um usuário
    const id = uuidV4();
    const password = await hash(USER_PASSWORD, 8);
    await connection.query(
      `INSERT INTO users(id, name, email, password, created_at, updated_at)
        VALUES('${id}', '${USER_NAME}', '${USER_EMAIL}', '${password}', 'NOW()', 'NOW()')
      `
    );
  });

  afterAll(async () => {
    // Exclui dados e tabelas do BD
    await connection.dropDatabase();
    // Fecha a conexão com o BD
    await connection.close();
  });

  it('should be able to get the balance for a given user', async () => {
    // Faz login para obter o token do usuário
    const responseToken = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: USER_EMAIL,
        password: USER_PASSWORD,
      });
    const { token } = responseToken.body;

    // Cria um novo depósito
    await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 120.00,
        description: 'Bank transfer',
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    // Cria um novo saque
    await request(app)
      .post('/api/v1/statements/withdraw')
      .send({
        amount: 70.00,
        description: 'Cash withdraw',
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const response = await request(app)
      .get('/api/v1/statements/balance')
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('statement');
    expect(response.body.statement.length).toBe(2);
    expect(Number(response.body.balance)).toBe(50.00);
  });

  it('should not be able to get the balance for a non existing user', async () => {
    // Token inválido
    const invalidToken = 'abcdefghijklmnopqrstuvwxyz';

    // Tenta obter o balanço, sem criar o usuário
    const response = await request(app)
      .get('/api/v1/statements/balance')
      .set({
        Authorization: `Bearer ${invalidToken}`,
      });

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('JWT invalid token!');
  });

  it('should not be able to get the balance if the token is missing', async () => {
    // Tenta obter o balanço, sem informar o token
    const response = await request(app)
      .get('/api/v1/statements/balance');

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('JWT token is missing!');
  });
});
