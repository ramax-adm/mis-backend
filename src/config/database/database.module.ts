import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnvModule } from '../env/env.module';
import { EnvService } from '../env/env.service';
import { join } from 'path';
import { User } from '@/modules/user/entities/user.entity';
import { Holiday } from '@/modules/utils/entities/holiday.entity';
import { CashFlowSimulation } from '@/modules/cash-flow/entities/cash-flow-simulation.entity';
import { Company } from '@/core/entities/sensatta/company.entity';
import { IncomingBatches } from '@/core/entities/sensatta/incoming-batch.entity';
import { ProductLine } from '@/core/entities/sensatta/product-line.entity';
import { Product } from '@/core/entities/sensatta/product.entity';
import { ReferencePrice } from '@/core/entities/sensatta/reference-price.entity';
import { Warehouse } from '@/core/entities/sensatta/warehouse.entity';
import { CashFlowProduct } from '@/modules/cash-flow/entities/cash-flow-product.entity';
import { ExternalIncomingBatch } from '@/core/entities/external/external-incoming-batch.entity';
import { UploadFile } from '@/modules/utils/entities/upload-file.entity';
import { UploadedFile } from '@/modules/utils/entities/uploaded-files.entity';
import { CattlePurchaseFreight } from '@/core/entities/sensatta/cattle-purchase-freight.entity';
import { UserSensattaCompany } from '@/modules/user/entities/user-sensatta-company.entity';
import { ExternalHumanResourcesHours } from '@/core/entities/external/external-human-resources-hours.entity';
import { AppWebpage } from '@/core/entities/application/app-webpage.entity';
import { UserAppWebpage } from '@/modules/user/entities/user-app-webpage.entity';
import { StockBalance } from '@/modules/stock/stock-balance/entities/stock-balance.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [EnvModule],
      inject: [EnvService],
      useFactory: (envService: EnvService) => ({
        type: 'postgres', // Tipo do banco de dados
        host: envService.get('DB_HOST'),
        port: envService.get('DB_PORT'),
        username: envService.get('DB_USERNAME'),
        password: envService.get('DB_PASSWORD'),
        database: envService.get('DB_NAME'),
        schema: envService.get('DB_SCHEMA'),
        ssl: envService.get('DB_SSL'),
        synchronize: false,
        entities: [join(__dirname, '..', '..', '**', '*.entity.{ts,js}')],
        migrations: [join(__dirname, './migrations/**/*.{ts,js}')],
        logging: envService.get('DB_LOGGING'),
      }),
    }),
    TypeOrmModule.forFeature([
      // App params
      AppWebpage,

      CashFlowSimulation,
      CashFlowProduct,
      Holiday,
      User,
      UserSensattaCompany,
      UserAppWebpage,

      // sensatta
      CattlePurchaseFreight,
      Company,
      IncomingBatches,
      Product,
      ProductLine,
      ReferencePrice,
      StockBalance,
      Warehouse,

      // external & upload
      ExternalHumanResourcesHours,
      ExternalIncomingBatch,
      UploadFile,
      UploadedFile,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
