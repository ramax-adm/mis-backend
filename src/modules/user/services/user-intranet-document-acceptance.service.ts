import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserIntranetDocumentAcceptance } from '../entities/user-intranet-documents-acceptance.entity';

@Injectable()
export class UserIntranetDocumentAcceptanceService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserIntranetDocumentAcceptance)
    private readonly userIntranetDocumentAcceptanceRepository: Repository<UserIntranetDocumentAcceptance>,
  ) {}

  async create({
    userId,
    documentVersionId,
    acceptanceTimeInSeconds,
    ipAddress,
  }: {
    userId: string;
    documentVersionId: string;
    ipAddress: string;
    acceptanceTimeInSeconds: number;
  }) {
    const existingUser = await this.userRepository.findOneBy({
      id: userId,
    });

    if (!existingUser) {
      throw new ConflictException('A user with this id not exists');
    }

    return this.userIntranetDocumentAcceptanceRepository.save({
      documentVersionId,
      userId,
      acceptanceTimeInSeconds,
      ipAddress,
    });
  }

  async remove({ id }: { id: string }) {
    const existingUserDocumentAcceptance =
      await this.userIntranetDocumentAcceptanceRepository.findOneBy({
        id,
      });

    if (!existingUserDocumentAcceptance) {
      throw new ConflictException(
        'A user document acceptance with this id not exists',
      );
    }
    return this.userIntranetDocumentAcceptanceRepository.delete({ id });
  }
}
