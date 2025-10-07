import { Module } from '@nestjs/common';
import { BusinessAuditController } from './controllers/business-audit.controller';
import { BusinessAuditOverviewService } from './services/business-audit-overview.service';
import { BusinessAuditSalesService } from './services/business-audit-sales.service';
import { BusinessAuditSalesReportService } from './services/business-audit-sales-report.service';
import { ExcelReaderService } from '@/core/services/excel-reader.service';
import { BusinessAuditReturnOccurrencesService } from './services/business-audit-return-occurrences.service';
import { BusinessAuditReturnOccurrencesController } from './controllers/business-audit-return-occurrences.controller';
import { BusinessAuditOverviewController } from './controllers/business-audit-overview.controller';
import { BusinessAuditSalesController } from './controllers/business-audit-sales.controller';
import { BusinessAuditReturnOccurrencesReportService } from './services/business-audit-return-occurrences-report.service';

@Module({
  providers: [
    BusinessAuditOverviewService,
    BusinessAuditSalesService,
    BusinessAuditSalesReportService,
    BusinessAuditReturnOccurrencesService,
    BusinessAuditReturnOccurrencesReportService,
    ExcelReaderService,
  ],
  controllers: [
    BusinessAuditController,
    BusinessAuditOverviewController,
    BusinessAuditSalesController,
    BusinessAuditReturnOccurrencesController,
  ],
})
export class BusinessAuditModule {}
