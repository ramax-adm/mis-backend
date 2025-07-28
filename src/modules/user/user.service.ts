import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as crypto from 'crypto';
import { hashSync } from 'bcryptjs';
import { PasswordTokenDto } from './dto/password-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserRole } from '@/core/enums/user-role.enum';
import { DateUtils } from '../utils/services/date.utils';
import { IEmailService } from '../aws';
import { EmailUtils } from '../utils/services/email.utils';
import { EmailTemplateEnum } from '../utils/enums/email-template.enum';
import { IPASSWORD_RECOVERY_TEMPLATE } from '../utils/emails/password-recovery.template';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject('EMAIL_SERVICE')
    private readonly sesEmailService: IEmailService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.userRepository.findOneBy({
      email: createUserDto.email,
    });

    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    Object.assign(createUserDto, {
      isActive: true,
      password: hashSync(createUserDto.password, 10),
    });

    return this.userRepository.save(createUserDto);
  }

  async profile(userId: string) {
    return await this.userRepository.findOne({
      where: { id: userId },
      relations: {
        userCompanies: true,
        userWebpages: {
          page: true,
        },
      },
    });
  }

  async findAll(roles: string[] = []) {
    const where = roles.length > 0 ? { role: In(roles) } : {};
    return this.userRepository.find({
      where,
      relations: {
        userCompanies: true,
        userWebpages: {
          page: true,
        },
      },
      order: {
        name: 'ASC',
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const userToUpdate = await this.userRepository.findOneBy({ id });
    if (!userToUpdate) {
      throw new NotFoundException(`User with ID "${id}" not found.`);
    }
    if (updateUserDto.email && updateUserDto.email !== userToUpdate.email) {
      const existingUser = await this.userRepository.findOneBy({
        email: updateUserDto.email,
      });
      if (existingUser) {
        throw new ConflictException('A user with this email already exists');
      }
    }
    if (updateUserDto.password) {
      updateUserDto.password = hashSync(updateUserDto.password, 10);
    }
    if (updateUserDto.role) {
      updateUserDto.role = updateUserDto.role;
    }
    if (typeof updateUserDto.isActive !== 'undefined') {
      updateUserDto.isActive = updateUserDto.isActive;
    }
    const updatedUser = this.userRepository.merge(userToUpdate, updateUserDto);
    return this.userRepository.save(updatedUser);
  }

  async remove(id: string) {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID "${id}" not found.`);
    }
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException(`User with email "${email}" not found.`);
    }

    // Token generation
    const token = crypto.randomBytes(3).toString('hex');
    await this.userRepository.save({ ...user, resetPasswordToken: token });

    // Email sending
    const passwordRecoveryPayload = {
      username: user.name,
      token,
    };
    const emailTemplate =
      EmailUtils.createFromTemplate<IPASSWORD_RECOVERY_TEMPLATE>(
        passwordRecoveryPayload,
        EmailTemplateEnum.PASSWORD_RECOVERY,
      );

    console.log({
      toAddresses: [email],
      ccAddresses: [],
      subject: 'Recuperação de senha!',
      htmlBody: emailTemplate,
    });

    await this.sesEmailService.sendEmail({
      ccAddresses: [],
      htmlBody: emailTemplate,
      subject: 'Recuperação de senha!',
      toAddresses: [email],
    });
  }

  async checkPasswordToken(passwordTokenDto: PasswordTokenDto) {
    const email = passwordTokenDto.email;
    const user = await this.userRepository.findOne({
      where: { email, resetPasswordToken: passwordTokenDto.token },
    });
    if (user && passwordTokenDto.token == (await user).resetPasswordToken) {
      return true;
    }
    return false;
  }

  async resetPassword(changePasswordDto: ChangePasswordDto) {
    const newPassword = changePasswordDto.password;
    const email = changePasswordDto.email;
    const user = await this.userRepository.findOne({
      where: { email, resetPasswordToken: changePasswordDto.token },
    });
    if (user && changePasswordDto.token == (await user).resetPasswordToken) {
      this.update(user.id, { password: newPassword });
    }
  }

  async checkIfUserHasPermissionByRole(
    userId: string,
    roles: UserRole[],
    user?: User,
  ) {
    if (!user) user = await this.profile(userId);

    if (!roles || roles.length === 0) return true;

    const hasPermission = roles.find((r) => r === user.role);
    if (hasPermission) return true;

    return false;
  }

  /**
   * Verifica se um usuário tem permissão para editar um registro.
   *
   * Usuarios podem editar seus proprios recursos caso seja ele mesmo quem criou e no mesmo dia
   * @param userId ID do usuário
   * @param createdBy ID do usuário que criou o registro
   * @param recordDate Data do registro
   * @param roles Papéis permitidos
   * @returns {Promise<boolean>} Verdadeiro se o usuário for um administrador ou se a data do registro for a mesma do dia atual, caso contrário, falso.
   */
  async canUserEditRecord(
    userId: string,
    createdBy: string,
    recordDate: Date,
    roles: UserRole[],
  ): Promise<{
    user: User;
    hasPermission: boolean;
  }> {
    const userExists = await this.profile(userId);
    if (!userExists) throw new BadRequestException('Usuário não encontrado');

    const isAdmin = await this.checkIfUserHasPermissionByRole(
      userId,
      roles,
      userExists,
    );

    const isSameDay = DateUtils.isSameDay(recordDate, new Date());

    const isSameCreator = createdBy === userId;

    return {
      user: userExists,
      hasPermission: isAdmin || (isSameDay && isSameCreator),
    };
  }
}
