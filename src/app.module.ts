import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { DatabaseModule } from './config/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { SharedSensattaController } from './shared/sensatta/shared-sensatta.controller';
import { SensattaController } from './modules/sensatta/controllers/sensatta.controller';
import { ParametersModule } from './modules/parameters/parameters.module';
import { SalesModule } from './modules/sales/sales.module';
import { EnvModule } from './config/env/env.module';
import { PurchasesModule } from './modules/purchases/purchases.module';
import { BusinessAuditModule } from './modules/business-audit/business-audit.module';
import { StockModule } from './modules/stock/stock.module';
import { CashFlowModule } from './modules/cash-flow';
import { UserModule } from './modules/user/user.module';
import { AwsModule } from './modules/aws/aws.module';
import { UtilsModule } from './modules/utils/utils.module';
import { FreightsModule } from './modules/freights/freights.module';
import { HumanResourcesModule } from './modules/human-resources/human-resources.module';
import { IntranetModule } from './modules/intranet/intranet.module';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    // config modules
    DatabaseModule,
    EnvModule,
    HttpModule,
    ScheduleModule.forRoot(),

    // domain modules
    AwsModule,
    AuthModule,
    BusinessAuditModule,
    CashFlowModule,
    FreightsModule,
    HumanResourcesModule,
    IntranetModule,
    ParametersModule,
    PurchasesModule,
    SalesModule,
    SharedModule,
    StockModule,
    UserModule,
    UtilsModule,
  ],
  controllers: [
    AppController,

    // sensatta
    SensattaController,
  ],
})
export class AppModule {}
