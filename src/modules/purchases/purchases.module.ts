import { Module } from '@nestjs/common';
import { PurchaseController } from './controllers/purchase.controller';
import { CattlePurchaseController } from './controllers/cattle-purchase.controller';
import { ExcelReaderService } from '@/core/services/excel-reader.service';
import { CattlePurchaseService } from './services/cattle-purchase.service';
import { CattlePurchaseReportService } from './services/cattle-purchase-report.service';

@Module({
  providers: [
    ExcelReaderService,
    CattlePurchaseService,
    CattlePurchaseReportService,
  ],
  controllers: [PurchaseController, CattlePurchaseController],
})
export class PurchasesModule {}
