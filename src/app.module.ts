import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { EnvService } from './config/env/env.service';
import { DatabaseModule } from './config/database/database.module';
import { S3StorageModule } from './modules/aws/s3-storage/s3-storage.module';
import { UtilsService } from './modules/utils/utils.service';
import { AuthModule } from './modules/auth/auth.module';
import { CashFlowController } from './controllers/cash-flow/cash-flow.controller';
import { UserService } from './modules/user/user.service';
import { CashFlowSimulationService } from './modules/cash-flow/cash-flow-simulation.service';
import { CashFlowService } from './modules/cash-flow/cash-flow.service';
import { UserController } from './controllers/users/user.controller';
import { ExcelReaderService } from './core/services/excel-reader.service';
import { CashFlowReportService } from './modules/cash-flow/cash-flow-report.service';
import { SESEmailModule } from './modules/aws/ses-email/ses-email.module';
import { CashFlowChampionCattleService } from './modules/cash-flow/cash-flow-champion-cattle.service';
import { SharedSensattaController } from './controllers/shared/shared-sensatta.controller';
import { UploadController } from './controllers/utils/upload.controller';
import { UploadService } from './modules/utils/upload/upload.service';
import { FreightsController } from './controllers/freights/freights.controller';
import { CattlePurchaseFreightService } from './modules/freights/cattle-purchase-freights.service';
import { CattlePurchaseFreightsReportService } from './modules/freights/cattle-purchase-freights-report.service';
import { HumanResourcesHoursService } from './modules/human-resources/human-resources-hours.service';
import { HumanResourcesHoursReportService } from './modules/human-resources/human-resources-hours-report.service';
import { UploadFileService } from './modules/utils/upload/upload-file.service';
import { UserSensattaCompanyService } from './modules/user/user-sensatta-company.service';
import { UserAppWebpageService } from './modules/user/user-app-webpage.service';
import { ApplicationController } from './controllers/application.controller';
import { UtilsController } from './controllers/utils/utils.controller';
import { HumanResourcesHoursController } from './controllers/human-resources/human-resources-hours.controller';
import { SensattaController } from './modules/sensatta/controllers/sensatta.controller';
import { ParametersModule } from './modules/parameters/parameters.module';
import { SalesModule } from './modules/sales/sales.module';
import { EnvModule } from './config/env/env.module';
import { PurchasesModule } from './modules/purchases/purchases.module';
import { BusinessAuditModule } from './modules/business-audit/business-audit.module';
import { StockModule } from './modules/stock/stock.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    DatabaseModule,
    EnvModule,
    HttpModule,

    // aws
    S3StorageModule,
    SESEmailModule,

    AuthModule,

    BusinessAuditModule,
    PurchasesModule,
    SalesModule,
    StockModule,
    ParametersModule,
  ],
  controllers: [
    AppController,
    ApplicationController,
    CashFlowController,
    HumanResourcesHoursController,

    UserController,

    // sensatta
    FreightsController,
    SharedSensattaController,
    SensattaController,
    UploadController,
    UtilsController,
  ],
  providers: [
    CattlePurchaseFreightService,
    CattlePurchaseFreightsReportService,

    // cash-flow
    CashFlowService,
    CashFlowChampionCattleService,
    CashFlowReportService,
    CashFlowSimulationService,

    EnvService,
    ExcelReaderService,

    HumanResourcesHoursReportService,
    HumanResourcesHoursService,

    UserService,
    UserSensattaCompanyService,
    UserAppWebpageService,
    UtilsService,
    UploadService,
    UploadFileService,
  ],
})
export class AppModule {}
