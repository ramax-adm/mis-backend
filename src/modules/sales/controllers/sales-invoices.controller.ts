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
import { ExportSalesInvoicesReportDto } from '../dtos/request/sales-invoices-export-report-request.dto';
import { Response } from 'express';
import { SalesInvoicesReportService } from '../services/sales-invoices-report.service';
import { SalesInvoicesGetAnalyticalDataRequestDto } from '../dtos/request/sales-invoices-get-analytical-data-request.dto';
import { SWAGGER_API_SECURITY } from '@/core/constants/swagger-security';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ApiControllerDoc } from '@/core/decorators/api-doc.decorator';

@ApiTags('Faturamento')
@ApiBearerAuth(SWAGGER_API_SECURITY.BEARER_AUTH)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sales/invoice')
export class SalesInvoicesController {
  constructor(
    private readonly dataSource: DataSource,
    private readonly httpService: HttpService,
    private readonly envService: EnvService,
    private readonly salesInvoicesService: SalesInvoicesService,
    private readonly salesInvoicesReportService: SalesInvoicesReportService,
  ) {}

  @ApiControllerDoc({
    summary: 'Faturamento: Ultima atualização',
    successStatus: HttpStatus.OK,
    successDescription:
      'Retorna a data e hora da ultima atualização dos dados de faturamento.',
  })
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

  @ApiControllerDoc({
    summary: 'Filtro: Lista de CFOPs',
    successStatus: HttpStatus.OK,
    successDescription:
      'Retorna uma lista de cfops para servir como filtro ao front-end',
  })
  @Get('/filters/cfops')
  @HttpCode(HttpStatus.OK)
  async getCfops() {
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

    // if (companyCode) {
    //   qb.andWhere('si.company_code = :companyCode', { companyCode });
    // }
    // if (startDate) {
    //   qb.andWhere('si.date >= :startDate', { startDate });
    // }
    // if (endDate) {
    //   qb.andWhere('si.date <= :endDate', { endDate });
    // }

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

  @ApiControllerDoc({
    summary: 'Filtro: Lista de Clientes',
    successStatus: HttpStatus.OK,
    successDescription:
      'Retorna uma lista de clientes para servir como filtro ao front-end',
  })
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

  @ApiControllerDoc({
    summary: 'Filtro: Situação NF',
    successStatus: HttpStatus.OK,
    successDescription:
      'Retorna uma lista de situações possiveis para uma NF para servir como filtro ao front-end',
  })
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

    // if (companyCode) {
    //   qb.andWhere('si.company_code = :companyCode', { companyCode });
    // }
    // if (startDate) {
    //   qb.andWhere('si.date >= :startDate', { startDate });
    // }
    // if (endDate) {
    //   qb.andWhere('si.date <= :endDate', { endDate });
    // }

    const results = await qb.getRawMany<{
      nf_situation: string;
    }>();

    return results.map((i) => ({
      key: i.nf_situation,
      label: i.nf_situation,
      value: i.nf_situation,
    }));
  }

  @Get('resumed')
  @HttpCode(HttpStatus.OK)
  async getResumedData(
    @Query('companyCode') companyCode: string,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ) {}

  @ApiControllerDoc({
    summary: 'Faturamento: Listagem Analitica',
    successStatus: HttpStatus.OK,
    successDescription:
      'Retorna uma listagem analitica das NFs de faturamento.',
  })
  @Get('analytical')
  @HttpCode(HttpStatus.OK)
  async getAnalyticalData(
    @Query() requestDto: SalesInvoicesGetAnalyticalDataRequestDto,
  ) {
    return await this.salesInvoicesService.getAnalyticalData(requestDto);
  }

  @Post('/sync')
  @HttpCode(HttpStatus.CREATED)
  async syncInvoiceWithServer() {
    const { post } = this.httpService.axiosRef;
    const reqUrl = this.envService
      .get('SERVER_API_URL')
      .concat('/sensatta/sync/invoice');
    const reqData = {};
    const reqConfig = { timeout: 200 * 1000 };

    try {
      await post(reqUrl, reqData, reqConfig);
    } catch (error) {
      throw error;
    }
  }

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
