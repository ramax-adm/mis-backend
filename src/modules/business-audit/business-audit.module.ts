import { Module } from '@nestjs/common';
import { BusinessAuditController } from './controllers/business-audit.controller';
import { BusinessAuditOverviewService } from './services/business-audit-overview.service';
import { BusinessAuditSalesService } from './services/business-audit-sales.service';
import { BusinessAuditSalesReportService } from './services/business-audit-sales-report.service';
import { ExcelReaderService } from '@/core/services/excel-reader.service';
import { BusinessAuditReturnOccurrencesService } from './services/business-audit-return-occurrences.service';

@Module({
  providers: [
    BusinessAuditOverviewService,
    BusinessAuditSalesService,
    BusinessAuditSalesReportService,
    BusinessAuditReturnOccurrencesService,
    ExcelReaderService,
  ],
  controllers: [BusinessAuditController],
})
export class BusinessAuditModule {}
