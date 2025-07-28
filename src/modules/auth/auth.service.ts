import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';

// TODO REFRESH TOKEN

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user: User = await this.usersRepository.findOne({
      where: { email },
      relations: {
        userCompanies: true,
        userWebpages: {
          page: true,
        },
      },
    });

    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (passwordMatch) {
        delete user.password;
        return user;
      }
    }
    return null;
  }

  async login({ email, password }: Pick<User, 'email' | 'password'>) {
    const user = await this.validateUser(email, password);

    if (user == null) {
      throw new BadRequestException('E-mail ou senha incorretos');
    }

    if (!user.isActive) {
      throw new BadRequestException('Sua conta está inativa');
    }

    delete user.password;

    let access_token = '';
    try {
      access_token = this.jwtService.sign({ ...user });
    } catch (error: unknown) {
      console.error('ERROR ON SIGN JWT');
      console.error({ error });
      throw error;
    }

    return {
      user,
      access_token,
    };
  }

  async validateAndGenarateToken(
    email: string,
    password: string,
  ): Promise<string> {
    try {
      const loginAttempt = await this.login({ email, password });
      const token = loginAttempt.access_token;
      return token;
    } catch (error: unknown) {
      console.error('ERROR ON validateAndGenarateToken');
      console.error({ error });
      throw new BadRequestException('Erro ao realizar login');
    }
  }
}
