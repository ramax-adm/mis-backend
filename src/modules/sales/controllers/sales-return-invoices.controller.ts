import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { SalesReturnInvoicesService } from '../services/sales-return-invoices.service';

@Controller('sales/return-invoice')
export class SalesReturnInvoicesController {
  constructor(
    private readonly salesReturnInvoicesService: SalesReturnInvoicesService,
  ) {}

  @Get('resumed')
  @HttpCode(HttpStatus.OK)
  async getResumedData(
    @Query('companyCode') companyCode: string,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ) {}

  @Get('analytical')
  @HttpCode(HttpStatus.OK)
  async getAnalyticalData(
    @Query('companyCode') companyCode: string,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
    @Query('clientCode') clientCode: string,
    @Query('salesRepresentativeCode') salesRepresentativeCode: string,
    @Query('productCode') productCode: string,
  ) {
    return await this.salesReturnInvoicesService.getAnalyticalData({
      companyCode,
      clientCode,
      productCode,
      salesRepresentativeCode,
      startDate,
      endDate,
    });
  }
}
