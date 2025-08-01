import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { InvoicesNfTypesEnum } from '../enums/invoices-nf-types.enum';
import { InvoicesSituationsEnum } from '../enums/invoices-situations.enum';
import { SalesInvoicesService } from '../services/sales-invoices.service';

@Controller('sales/invoice')
export class SalesInvoicesController {
  constructor(private readonly salesInvoicesService: SalesInvoicesService) {}

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
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('clientCode') clientCode?: string,
    @Query('cfopCode') cfopCode?: string,
    @Query('nfType') nfType?: InvoicesNfTypesEnum,
    @Query('nfNumber') nfNumber?: string,
    @Query('nfSituation') nfSituation?: InvoicesSituationsEnum,
  ) {
    return await this.salesInvoicesService.getAnalyticalData({
      companyCode,
      clientCode,
      startDate,
      endDate,
      cfopCode,
      nfNumber,
      nfSituation,
      nfType,
    });
  }
}
