import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { ShowUserProfileUseCase } from './ShowUserProfileUseCase';
import { ShowUserProfileError } from './ShowUserProfileError';

let showUserProfileUseCase: ShowUserProfileUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;

describe('Show User Profile', () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(
      usersRepositoryInMemory,
    );
  });

  it('should be able to show a user\'s profile', async () => {
    // Cria um usuário
    const user = {
      name: 'John Doe',
      email: 'john.doe@foo.com',
      password: 'any'
    }
    const createdUser = await usersRepositoryInMemory.create(user);
    // Busca o perfil do usuário
    const userProfile = await showUserProfileUseCase.execute(createdUser.id!);

    expect(userProfile).toHaveProperty('id');
    expect(userProfile.id).toBe(createdUser.id!);
    expect(userProfile.name).toBe(user.name);
    expect(userProfile.email).toBe(user.email);
  });

  it('should not be able to show a profile of a non-existent user', async () => {
    // Tenta exibir um perfil de usuário não existente
    expect(async () => {
      await showUserProfileUseCase.execute('non-existent');
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
