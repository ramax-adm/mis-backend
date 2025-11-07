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
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ReturnOccurrencesService } from '../services/return-occurrences.service';
import { GetReturnOccurrencesAnalyticalDataRequestDto } from '../dtos/request/return-occurrences-get-analytical-data-request.dto';
import { ApiControllerDoc } from '@/core/decorators/api-doc.decorator';
import { SWAGGER_API_SECURITY } from '@/core/constants/swagger-security';
import { ReturnOccurrence } from '../entities/return-occurrence.entity';

@ApiTags('Devoluções')
@ApiBearerAuth(SWAGGER_API_SECURITY.BEARER_AUTH)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sales/return-occurrences')
export class ReturnOccurrencesController {
  constructor(
    private readonly dataSource: DataSource,
    private readonly httpService: HttpService,
    private readonly envService: EnvService,
    private readonly returnOccurrencesService: ReturnOccurrencesService,
  ) {}

  @ApiControllerDoc({
    summary: 'Devoluções: Ultima atualização',
    successStatus: HttpStatus.OK,
    successDescription:
      'Retorna a data e hora da ultima atualização dos dados de devoluções.',
  })
  @Get('/last-update')
  @HttpCode(HttpStatus.OK)
  async getLastUpdatedAt() {
    const qb = this.dataSource
      .createQueryBuilder()
      .select(['ro.created_at'])
      .from('sensatta_return_occurrences', 'ro')
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
    summary: 'Filtro: Clientes',
    successStatus: HttpStatus.OK,
    successDescription:
      'Retorna uma lista de clientes para servir como filtragem no front-end.',
  })
  @Get('/filters/clients')
  @HttpCode(HttpStatus.OK)
  async getClients(
    @Query('companyCode') companyCode?: string,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    const qb = this.dataSource
      .createQueryBuilder()
      .select(['ro.client_code', 'ro.client_name'])
      .from('sensatta_return_occurrences', 'ro')
      .distinct(true)
      .where('1=1')
      .orderBy('ro.client_name', 'ASC');

    if (companyCode) {
      qb.andWhere('ro.company_code = :companyCode', { companyCode });
    }
    if (startDate) {
      qb.andWhere('ro.date >= :startDate', { startDate });
    }
    if (endDate) {
      qb.andWhere('ro.date <= :endDate', { endDate });
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
    summary: 'Filtro: Representantes',
    successStatus: HttpStatus.OK,
    successDescription:
      'Retorna uma lista de representantes para servir como filtragem no front-end.',
  })
  @Get('/filters/representatives')
  @HttpCode(HttpStatus.OK)
  async getRepresentatives(
    @Query('companyCode') companyCode?: string,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    const qb = this.dataSource
      .createQueryBuilder()
      .select(['ro.sales_representative_code', 'ro.sales_representative_name'])
      .from('sensatta_return_occurrences', 'ro')
      .distinct(true)
      .where('1=1')
      .orderBy('ro.sales_representative_name', 'ASC');

    if (companyCode) {
      qb.andWhere('ro.company_code = :companyCode', { companyCode });
    }
    if (startDate) {
      qb.andWhere('ro.date >= :startDate', { startDate });
    }
    if (endDate) {
      qb.andWhere('ro.date <= :endDate', { endDate });
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
    summary: 'Filtro: Motivos de Ocorrência',
    successStatus: HttpStatus.OK,
    successDescription:
      'Retorna uma lista de motivos de ocorrência para servir como filtragem no front-end.',
  })
  @Get('filters/causes')
  @HttpCode(HttpStatus.OK)
  async getReturnOccurrencesCauses() {
    const results = await this.dataSource
      .getRepository(ReturnOccurrence)
      .createQueryBuilder('ro')
      .select(['ro.occurrenceCause'])
      .distinctOn(['ro.occurrenceCause'])
      .getMany();
    return results.map((i) => ({
      key: i.occurrenceCause,
      label: i.occurrenceCause,
      value: i.occurrenceCause,
    }));
  }

  @ApiControllerDoc({
    summary: 'Devoluções: Listagem Analitica',
    successStatus: HttpStatus.OK,
    successDescription: 'Retorna os dados das devoluções e seus totais',
  })
  @Get('analytical')
  @HttpCode(HttpStatus.OK)
  async getAnalyticalData(
    @Query() requestQuery: GetReturnOccurrencesAnalyticalDataRequestDto,
  ) {
    return await this.returnOccurrencesService.getAnalyticalData(requestQuery);
  }

  //   @Post('/sync')
  //   @HttpCode(HttpStatus.CREATED)
  //   async syncInvoiceWithServer() {
  //     const { post } = this.httpService.axiosRef;
  //     const reqUrl = this.envService
  //       .get('SERVER_API_URL')
  //       .concat('/sensatta/sync/invoice');
  //     const reqData = {};
  //     const reqConfig = { timeout: 200 * 1000 };
  //     console.log({ reqUrl });

  //     try {
  //       await post(reqUrl, reqData, reqConfig);
  //     } catch (error) {
  //       throw error;
  //     }
  //   }

  //   @Post('/export-xlsx')
  //   @HttpCode(HttpStatus.OK)
  //   async exportXLSX(
  //     @Body() dto: ExportSalesInvoicesReportDto,
  //     @Res() res: Response,
  //   ) {
  //     const result = await this.salesInvoicesReportService.exportAnalytical(dto);

  //     const now = new Date();
  //     const year = now.getFullYear();
  //     const month = String(now.getMonth() + 1).padStart(2, '0');
  //     const day = String(now.getDate()).padStart(2, '0');

  //     const formattedDate = `${year}-${month}-${day}`;
  //     res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
  //     res.header(
  //       'Content-Disposition',
  //       `attachment; filename=${formattedDate}-sales-invoices.xlsx`,
  //     );
  //     res.type(
  //       'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  //     );
  //     res.send(result);
  //   }
}
