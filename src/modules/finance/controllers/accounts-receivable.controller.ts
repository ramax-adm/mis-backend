import { SWAGGER_API_SECURITY } from '@/core/constants/swagger-security';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/user-roles.guard';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AccountsReceivableService } from '../services/accounts-receivable.service';
import { AccountsReceivableGetAnalyticalDataRequestDto } from '../dtos/request/accounts-receivable-get-analytical-data-request.dto';
import { ApiControllerDoc } from '@/core/decorators/api-doc.decorator';
import { DataSource } from 'typeorm';
import { DateUtils } from '@/modules/utils/services/date.utils';
import { AccountReceivable } from '../entities/account-receivable.entity';
import { Response } from 'express';
import { ExportAccountsReceivablesReportDto } from '../dtos/request/export-accounts-receivable-request.dto';

@ApiTags('Financeiro')
@ApiBearerAuth(SWAGGER_API_SECURITY.BEARER_AUTH)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('finance/account-receivable')
export class AccountsReceivableController {
  constructor(
    private readonly dataSource: DataSource,
    private readonly accountsReceivableService: AccountsReceivableService,
  ) {}

  @ApiControllerDoc({
    summary: 'Titulos a Receber: Ultima Atualização',
    successStatus: HttpStatus.OK,
    successDescription:
      'Retorna a data e hora da ultima atualização dos dados de devoluções.',
  })
  @Get('/last-update')
  @HttpCode(HttpStatus.OK)
  async getLastUpdatedAt() {
    const qb = this.dataSource
      .getRepository(AccountReceivable)
      .createQueryBuilder('ar')
      .select(['ar.createdAt'])
      .where('1=1')
      .limit(1);

    const result = await qb.getOne();

    return {
      parsedUpdatedAt: DateUtils.format(result.createdAt, 'datetime'),
      updatedAt: result.createdAt,
    };
  }

  @ApiControllerDoc({
    summary: 'Filtro: Clientes (Titulos a Receber)',
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
      .select(['ar.client_code', 'ar.client_name'])
      .from('sensatta_accounts_receivable', 'ar')
      .distinct(true)
      .where('1=1')
      .orderBy('ar.client_name', 'ASC');

    if (companyCode) {
      qb.andWhere('ar.company_code = :companyCode', { companyCode });
    }
    if (startDate) {
      qb.andWhere('ar.issue_date >= :startDate', { startDate });
    }
    if (endDate) {
      qb.andWhere('ar.issue_date <= :endDate', { endDate });
    }

    const results = await qb.getRawMany<{
      client_code: string;
      client_name: string;
    }>();

    return results.map((i) => ({
      key: i.client_code,
      label: `${i.client_code} - ${i.client_name}`,
      value: i.client_code,
    }));
  }

  @ApiControllerDoc({
    summary: 'Titulos a Receber: Listagem Analitica',
    successStatus: HttpStatus.OK,
    successDescription: 'Retorna uma listagem analitica dos titulos a receber.',
  })
  @Get('analytical')
  @HttpCode(HttpStatus.OK)
  async getAnalyticalData(
    @Query() requestDto: AccountsReceivableGetAnalyticalDataRequestDto,
  ) {
    return await this.accountsReceivableService.getAnalyticalData(requestDto);
  }
}
