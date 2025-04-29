import { OperationDREService } from '@/services/operation/operation-dre.service';
import { DateUtils } from '@/services/utils/date.utils';
import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';

@Controller('operation')
export class OperationDREController {
  constructor(private readonly operationDREService: OperationDREService) {}

  @Get('values')
  @HttpCode(HttpStatus.OK)
  async getValues(
    @Query('company-id') companyId: string,
    @Query('base-date') baseDate: string,
    @Query('start-date') startDate: string,
    @Query('end-date') endDate: string,
  ) {
    return this.operationDREService.getValues({
      companyId,
      baseDate: DateUtils.toDate(baseDate),
      startDate: DateUtils.toDate(startDate),
      endDate: DateUtils.toDate(endDate),
    });
  }
}
