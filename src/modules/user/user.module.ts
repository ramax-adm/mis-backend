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
import { UserSensattaCompanyController } from './controllers/user-company.controller';
import { UserIntranetDocumentAcceptance } from './entities/user-intranet-documents-acceptance.entity';
import { UserIntranetDocumentAcceptanceService } from './services/user-intranet-document-acceptance.service';
import { UserIntranetDocumentAcceptanceController } from './controllers/user-intranet-document-acceptance.controller';

@Module({
  imports: [
    AwsModule,
    TypeOrmModule.forFeature([
      User,
      UserSensattaCompany,
      UserAppWebpage,
      UserIntranetDocumentAcceptance,
    ]),
  ],
  controllers: [
    UserController,
    UserSensattaCompanyController,
    UserIntranetDocumentAcceptanceController,
  ],
  providers: [
    UserService,
    UserSensattaCompanyService,
    UserAppWebpageService,
    UserIntranetDocumentAcceptanceService,
  ],
})
export class UserModule {}
