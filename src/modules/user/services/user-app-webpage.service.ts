import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserAppWebpage } from '../entities/user-app-webpage.entity';

@Injectable()
export class UserAppWebpageService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserAppWebpage)
    private readonly userAppWebpageRepository: Repository<UserAppWebpage>,
  ) {}

  async create({ userId, pageId }: { userId: string; pageId: string }) {
    const existingUser = await this.userRepository.findOneBy({
      id: userId,
    });

    if (!existingUser) {
      throw new ConflictException('A user with this id not exists');
    }
    return this.userAppWebpageRepository.save({ pageId, userId });
  }

  async remove({ id }: { id: string }) {
    const existingAppWebpage = await this.userAppWebpageRepository.findOneBy({
      id,
    });

    if (!existingAppWebpage) {
      throw new ConflictException('A user webpage with this id not exists');
    }
    return this.userAppWebpageRepository.delete({ id });
  }
}
