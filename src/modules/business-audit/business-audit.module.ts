import { Module } from '@nestjs/common';
import { BusinessAuditController } from './controllers/business-audit.controller';
import { BusinessAuditOverviewService } from './services/business-audit-overview.service';
import { BusinessAuditSalesService } from './services/business-audit-sales.service';
import { BusinessAuditSalesReportService } from './services/business-audit-sales-report.service';
import { ExcelReaderService } from '@/core/services/excel-reader.service';

@Module({
  providers: [
    BusinessAuditOverviewService,
    BusinessAuditSalesService,
    BusinessAuditSalesReportService,
    ExcelReaderService,
  ],
  controllers: [BusinessAuditController],
})
export class BusinessAuditModule {}
