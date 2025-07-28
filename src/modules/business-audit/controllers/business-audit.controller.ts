import { Controller, Get, Query } from '@nestjs/common';
import { BusinessAuditService } from '../services/business-audit.service';

@Controller('business-audit')
export class BusinessAuditController {
  constructor(private readonly businessAuditService: BusinessAuditService) {}

  @Get('resumed')
  async getData(
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    return await this.businessAuditService.getData({
      startDate,
      endDate,
    });
  }
}
