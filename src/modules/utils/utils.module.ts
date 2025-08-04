import { Module } from '@nestjs/common';
import { UploadFileService } from './upload/upload-file.service';
import { UploadService } from './upload/upload.service';
import { UtilsService } from './utils.service';
import { EnvModule } from '@/config/env/env.module';
import { UploadController } from '@/modules/utils/controllers/upload.controller';
import { UtilsController } from '@/modules/utils/controllers/utils.controller';
import { AwsModule } from '../aws/aws.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from '@/core/entities/sensatta/company.entity';
import { UploadFile } from './entities/upload-file.entity';
import { UploadedFile } from './entities/uploaded-files.entity';
import { HttpModule } from '@nestjs/axios';
import { ApplicationController } from './controllers/application.controller';

@Module({
  imports: [
    AwsModule,
    EnvModule,
    HttpModule,
    TypeOrmModule.forFeature([Company, UploadFile, UploadedFile]),
  ],
  providers: [UtilsService, UploadFileService, UploadService],
  controllers: [UploadController, UtilsController, ApplicationController],
})
export class UtilsModule {}
