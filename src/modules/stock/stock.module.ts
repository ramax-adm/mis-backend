import { Module } from '@nestjs/common';
import { StockBalanceController } from './stock-balance/controllers/stock-balance.controller';
import { StockReportService } from './stock-incoming-batches/stock-report.service';
import { StockUtilsService } from './stock-incoming-batches/stock-utils.service';
import { StockService } from './stock-incoming-batches/stock.service';
import { StockBalanceReportService } from './stock-balance/services/stock-balance-report.service';
import { StockBalanceService } from './stock-balance/services/stock-balance.service';
import { StockController } from '@/modules/stock/stock-incoming-batches/controllers/stock.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from '@/core/entities/sensatta/company.entity';
import { ExternalIncomingBatch } from '@/core/entities/external/external-incoming-batch.entity';
import { IncomingBatches } from '@/modules/stock/entities/incoming-batch.entity';
import { ReferencePrice } from '@/core/entities/sensatta/reference-price.entity';
import { ExcelReaderService } from '@/core/services/excel-reader.service';
import { StockIncomingBatchesService } from './stock-incoming-batches-new/services/stock-incoming-batches.service';
import { StockIncomingBatchesController } from './stock-incoming-batches-new/controllers/stock-incoming-batches.controller';
import { StockIncomingBatchesReportService } from './stock-incoming-batches-new/services/stock-incoming-batches-report.service';
import { InventoryService } from './services/inventory.service';
import { InventoryController } from './controllers/inventory.controller';

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
    InventoryService,
    StockService,
    StockIncomingBatchesService,
    StockIncomingBatchesReportService,
    StockBalanceService,
    StockBalanceReportService,
    StockReportService,
    StockUtilsService,
  ],
  controllers: [
    InventoryController,
    StockController,
    StockIncomingBatchesController,
    StockBalanceController,
  ],
})
export class StockModule {}
