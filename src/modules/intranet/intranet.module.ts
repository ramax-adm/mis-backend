import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntranetDocumentVersion } from './entities/intranet-document-version.entity';
import { UserIntranetDocumentAcceptance } from '../user/entities/user-intranet-documents-acceptance.entity';
import { IntranetDocument } from './entities/intranet-document.entity';
import { IntranetDocumentController } from './controllers/intranet-document.controller';
import { AwsModule } from '../aws/aws.module';
import { IntranetDocumentService } from './services/intranet-document.service';
import { EnvModule } from '@/config/env/env.module';
import { ExcelReaderService } from '@/core/services/excel-reader.service';
import { IntranetDocumentReportService } from './services/intranet-document-report.service';

@Module({
  imports: [
    AwsModule,
    EnvModule,
    TypeOrmModule.forFeature([
      IntranetDocument,
      IntranetDocumentVersion,
      UserIntranetDocumentAcceptance,
    ]),
  ],
  providers: [
    IntranetDocumentService,
    IntranetDocumentReportService,
    ExcelReaderService,
  ],
  controllers: [IntranetDocumentController],
})
export class IntranetModule {}
