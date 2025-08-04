import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserSensattaCompany } from '../entities/user-sensatta-company.entity';

@Injectable()
export class UserSensattaCompanyService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserSensattaCompany)
    private readonly userSensattaCompanyRepository: Repository<UserSensattaCompany>,
  ) {}

  async create({
    userId,
    companyCode,
  }: {
    userId: string;
    companyCode: string;
  }) {
    const existingUser = await this.userRepository.findOneBy({
      id: userId,
    });

    if (!existingUser) {
      throw new ConflictException('A user with this id not exists');
    }
    return this.userSensattaCompanyRepository.save({ companyCode, userId });
  }

  async remove({ id }: { id: string }) {
    const existingUserCompany =
      await this.userSensattaCompanyRepository.findOneBy({
        id,
      });

    if (!existingUserCompany) {
      throw new ConflictException('A user company with this id not exists');
    }
    return this.userSensattaCompanyRepository.delete({ id });
  }
}
