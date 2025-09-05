import { FreightsController } from '@/modules/freights/controllers/freights.controller';
import { Module } from '@nestjs/common';
import { CattlePurchaseFreightsReportService } from './services/cattle-purchase-freights-report.service';
import { CattlePurchaseFreightService } from './services/cattle-purchase-freights.service';
import { ExcelReaderService } from '@/core/services/excel-reader.service';
import { FreightCompaniesController } from './controllers/freight-companies.controller';
import { FreightCompaniesService } from './services/freight-companies.service';

@Module({
  providers: [
    CattlePurchaseFreightService,
    CattlePurchaseFreightsReportService,
    FreightCompaniesService,
    ExcelReaderService,
  ],
  controllers: [FreightsController, FreightCompaniesController],
})
export class FreightsModule {}
