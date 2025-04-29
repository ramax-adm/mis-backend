import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { EnvService } from './config/env/env.service';
import { DatabaseModule } from './config/database/database.module';
import { S3StorageModule } from './services/aws/s3-storage/s3-storage.module';
import { UtilsService } from './services/utils/utils.service';
import { AuthModule } from './services/auth/auth.module';
import { CashFlowController } from './controllers/cash-flow.controller';
import { UserService } from './services/user/user.service';
import { OperationDREController } from './controllers/operation-dre.controller';
import { OperationDREService } from './services/operation/operation-dre.service';
import { CashFlowSimulationService } from './services/cash-flow/cash-flow-simulation.service';
import { CashFlowService } from './services/cash-flow/cash-flow.service';
import { UserController } from './controllers/user.controller';
import { ExcelReaderService } from './common/services/excel-reader.service';
import { CashFlowReportService } from './services/cash-flow/cash-flow-report.service';
import { SESEmailModule } from './services/aws/ses-email/ses-email.module';
import { StockController } from './controllers/stock.controller';
import { StockService } from './services/stock/stock.service';
import { SensattaController } from './controllers/sensatta.controller';
import { StockUtilsService } from './services/stock/stock-utils.service';
import { StockReportService } from './services/stock/stock-report.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    S3StorageModule,
    SESEmailModule,
    AuthModule,
    DatabaseModule,
    HttpModule,
  ],
  controllers: [
    AppController,
    CashFlowController,
    OperationDREController,
    StockController,
    UserController,

    // sensatta
    SensattaController,
  ],
  providers: [
    // cash-flow
    CashFlowService,
    CashFlowReportService,
    CashFlowSimulationService,

    EnvService,
    ExcelReaderService,

    OperationDREService,

    // stock
    StockService,
    StockReportService,
    StockUtilsService,

    UserService,
    UtilsService,
  ],
})
export class AppModule {}
