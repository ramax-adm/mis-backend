import { FreightsController } from '@/modules/freights/controllers/freights.controller';
import { Module } from '@nestjs/common';
import { CattlePurchaseFreightsReportService } from './services/cattle-purchase-freights-report.service';
import { CattlePurchaseFreightService } from './services/cattle-purchase-freights.service';
import { ExcelReaderService } from '@/core/services/excel-reader.service';

@Module({
  providers: [
    CattlePurchaseFreightService,
    CattlePurchaseFreightsReportService,
    ExcelReaderService,
  ],
  controllers: [FreightsController],
})
export class FreightsModule {}
