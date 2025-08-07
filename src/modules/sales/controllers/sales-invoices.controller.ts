import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { InvoicesNfTypesEnum } from '../enums/invoices-nf-types.enum';
import { InvoicesSituationsEnum } from '../enums/invoices-situations.enum';
import { SalesInvoicesService } from '../services/sales-invoices.service';
import { DataSource } from 'typeorm';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/user-roles.guard';
import { DateUtils } from '@/modules/utils/services/date.utils';
import { HttpService } from '@nestjs/axios';
import { EnvService } from '@/config/env/env.service';
import { DEFAULT_AXIOS_TIMEOUT } from '@/core/constants/default-axios-timeout';
import { ExportSalesInvoicesReportDto } from '../dtos/request/export-human-resources-hours-report.dto';
import { Response } from 'express';
import { SalesInvoicesReportService } from '../services/sales-invoices-report.service';

@Controller('sales/invoice')
export class SalesInvoicesController {
  constructor(
    private readonly dataSource: DataSource,
    private readonly httpService: HttpService,
    private readonly envService: EnvService,
    private readonly salesInvoicesService: SalesInvoicesService,
    private readonly salesInvoicesReportService: SalesInvoicesReportService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/last-update')
  @HttpCode(HttpStatus.OK)
  async getLastUpdatedAt() {
    const qb = this.dataSource
      .createQueryBuilder()
      .select(['si.created_at'])
      .from('sensatta_invoices', 'si')
      .where('1=1')
      .limit(1);

    const result = await qb.getRawOne<{
      created_at: Date;
    }>();

    return {
      parsedUpdatedAt: DateUtils.format(result.created_at, 'datetime'),
      updatedAt: result.created_at,
    };
  }

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
    @Query('cfopCodes') cfopCodes?: string,
    @Query('nfType') nfType?: InvoicesNfTypesEnum,
    @Query('nfNumber') nfNumber?: string,
    @Query('nfSituations') nfSituations?: string,
  ) {
    return await this.salesInvoicesService.getAnalyticalData({
      companyCode,
      clientCode,
      startDate,
      endDate,
      cfopCodes: cfopCodes?.split(','),
      nfNumber,
      nfSituations: nfSituations?.split(',') as InvoicesSituationsEnum[],
      nfType,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/sync')
  @HttpCode(HttpStatus.CREATED)
  async syncInvoiceWithServer() {
    const { post } = this.httpService.axiosRef;
    const reqUrl = this.envService
      .get('SERVER_API_URL')
      .concat('/sensatta/sync/invoice');
    const reqData = {};
    const reqConfig = { timeout: 200 * 1000 };
    console.log({ reqUrl });

    try {
      await post(reqUrl, reqData, reqConfig);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/export-xlsx')
  @HttpCode(HttpStatus.OK)
  async exportXLSX(
    @Body() dto: ExportSalesInvoicesReportDto,
    @Res() res: Response,
  ) {
    const result = await this.salesInvoicesReportService.exportAnalytical(dto);

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    res.header(
      'Content-Disposition',
      `attachment; filename=${formattedDate}-sales-invoices.xlsx`,
    );
    res.type(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.send(result);
  }
}
