import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAppWebpage } from './entities/user-app-webpage.entity';
import { UserSensattaCompany } from './entities/user-sensatta-company.entity';
import { User } from './entities/user.entity';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { UserSensattaCompanyService } from './services/user-sensatta-company.service';
import { UserAppWebpageService } from './services/user-app-webpage.service';
import { AwsModule } from '../aws/aws.module';

@Module({
  imports: [
    AwsModule,
    TypeOrmModule.forFeature([User, UserSensattaCompany, UserAppWebpage]),
  ],
  controllers: [UserController],
  providers: [UserService, UserSensattaCompanyService, UserAppWebpageService],
})
export class UserModule {}
