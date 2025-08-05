import { ExcelReaderService } from '@/core/services/excel-reader.service';
import { Module } from '@nestjs/common';
import { HumanResourcesHoursReportService } from './services/human-resources-hours-report.service';
import { HumanResourcesHoursService } from './services/human-resources-hours.service';
import { HumanResourcesHoursController } from './controllers/human-resources-hours.controller';

@Module({
  controllers: [HumanResourcesHoursController],
  providers: [
    ExcelReaderService,
    HumanResourcesHoursReportService,
    HumanResourcesHoursService,
  ],
})
export class HumanResourcesModule {}
