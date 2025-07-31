import { Module } from '@nestjs/common';
import { StockBalanceController } from './stock-balance/controllers/stock-balance.controller';
import { StockReportService } from './old/stock-report.service';
import { StockUtilsService } from './old/stock-utils.service';
import { StockService } from './old/stock.service';
import { StockBalanceReportService } from './stock-balance/services/stock-balance-report.service';
import { StockBalanceService } from './stock-balance/services/stock-balance.service';
import { StockController } from '@/controllers/stock.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from '@/core/entities/sensatta/company.entity';
import { ExternalIncomingBatch } from '@/core/entities/external/external-incoming-batch.entity';
import { IncomingBatches } from '@/core/entities/sensatta/incoming-batch.entity';
import { ReferencePrice } from '@/core/entities/sensatta/reference-price.entity';
import { ExcelReaderService } from '@/core/services/excel-reader.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Company,
      ReferencePrice,
      IncomingBatches,
      ExternalIncomingBatch,
    ]),
  ],
  providers: [
    ExcelReaderService,
    StockService,
    StockBalanceService,
    StockBalanceReportService,
    StockReportService,
    StockUtilsService,
  ],
  controllers: [StockController, StockBalanceController],
})
export class StockModule {}
