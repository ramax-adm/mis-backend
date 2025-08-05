import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InvoicesNfTypesEnum } from '../enums/invoices-nf-types.enum';
import { InvoicesSituationsEnum } from '../enums/invoices-situations.enum';
import { SalesInvoicesService } from '../services/sales-invoices.service';
import { DataSource } from 'typeorm';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/user-roles.guard';

@Controller('sales/invoice')
export class SalesInvoicesController {
  constructor(
    private readonly dataSource: DataSource,

    private readonly salesInvoicesService: SalesInvoicesService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/filters/cfops')
  @HttpCode(HttpStatus.OK)
  async getCfops(
    @Query('companyCode') companyCode: string,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ) {
    const qb = this.dataSource
      .createQueryBuilder()
      .select([
        'si.cfop_code',
        'UPPER(si.cfop_description) AS cfop_description',
      ])
      .from('sensatta_invoices', 'si')
      .distinct(true)
      .where('1=1')
      .orderBy('si.cfop_code', 'ASC');

    if (companyCode) {
      qb.andWhere('si.company_code = :companyCode', { companyCode });
    }
    if (startDate) {
      qb.andWhere('si.date >= :startDate', { startDate });
    }
    if (endDate) {
      qb.andWhere('si.date <= :endDate', { endDate });
    }

    const results = await qb.getRawMany<{
      cfop_code: string;
      cfop_description: string;
    }>();

    return results.map((i) => ({
      key: i.cfop_code,
      label: `${i.cfop_code} - ${i.cfop_description}`,
      value: i.cfop_code,
    }));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/filters/clients')
  @HttpCode(HttpStatus.OK)
  async getClients(
    @Query('companyCode') companyCode: string,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ) {
    const qb = this.dataSource
      .createQueryBuilder()
      .select(['si.client_code', 'si.client_name'])
      .from('sensatta_invoices', 'si')
      .distinct(true)
      .where('1=1')
      .orderBy('si.client_name', 'ASC');

    if (companyCode) {
      qb.andWhere('si.company_code = :companyCode', { companyCode });
    }
    if (startDate) {
      qb.andWhere('si.date >= :startDate', { startDate });
    }
    if (endDate) {
      qb.andWhere('si.date <= :endDate', { endDate });
    }

    const results = await qb.getRawMany<{
      client_code: string;
      client_name: string;
    }>();

    return results.map((i) => ({
      key: i.client_code,
      label: i.client_name,
      value: i.client_code,
    }));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/filters/nf-situations')
  @HttpCode(HttpStatus.OK)
  async getNfSituations(
    @Query('companyCode') companyCode: string,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ) {
    const qb = this.dataSource
      .createQueryBuilder()
      .select(['si.nf_situation'])
      .from('sensatta_invoices', 'si')
      .distinct(true)
      .where('1=1');

    if (companyCode) {
      qb.andWhere('si.company_code = :companyCode', { companyCode });
    }
    if (startDate) {
      qb.andWhere('si.date >= :startDate', { startDate });
    }
    if (endDate) {
      qb.andWhere('si.date <= :endDate', { endDate });
    }

    const results = await qb.getRawMany<{
      nf_situation: string;
    }>();

    return results.map((i) => ({
      key: i.nf_situation,
      label: i.nf_situation,
      value: i.nf_situation,
    }));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('resumed')
  @HttpCode(HttpStatus.OK)
  async getResumedData(
    @Query('companyCode') companyCode: string,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
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
