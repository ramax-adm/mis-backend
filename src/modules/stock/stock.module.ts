import { Module } from '@nestjs/common';
import { StockBalanceController } from './controllers/stock-balance.controller';
import { StockReportService } from './services/stock-report.service';
import { StockUtilsService } from './services/stock-utils.service';
import { StockService } from './services/stock.service';
import { StockBalanceReportService } from './services/stock-balance-report.service';
import { StockBalanceService } from './services/stock-balance.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from '@/core/entities/sensatta/company.entity';
import { ExternalIncomingBatch } from '@/core/entities/external/external-incoming-batch.entity';
import { IncomingBatches } from '@/modules/stock/entities/incoming-batch.entity';
import { ReferencePrice } from '@/modules/stock/entities/reference-price.entity';
import { ExcelReaderService } from '@/core/services/excel-reader.service';
import { StockIncomingBatchesService } from './services/stock-incoming-batches.service';
import { StockIncomingBatchesReportService } from './services/stock-incoming-batches-report.service';
import { InventoryService } from './services/inventory.service';
import { InventoryController } from './controllers/inventory.controller';
import { StockController } from './controllers/stock.controller';
import { StockIncomingBatchesController } from './controllers/stock-incoming-batches.controller';
import { InventoryReportService } from './services/inventory-report.service';

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
    InventoryReportService,
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
