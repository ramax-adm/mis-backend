import { randomBytes, randomUUID } from 'crypto';
import { User } from '../entities/user.entity';

export function MakeUser(payload: Partial<User>): User {
  const id = payload.id ?? randomUUID();
  const userRaw = {
    id,
    name: payload.name ?? 'test',
    cpf: payload.cpf ?? '999.999.999-99',
    resetPasswordToken: '',
    email: payload.email ?? 'test@test.com',
    password: payload.password ?? randomBytes(16).toString(),
    refreshToken: payload.refreshToken ?? '',
    role: payload.role ?? 'admin',
    isActive: payload.isActive ?? true,
    operationData: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  return {
    ...userRaw,
    toJSON: () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, resetPasswordToken, ...user } = userRaw;
      return user;
    },
  };
}
