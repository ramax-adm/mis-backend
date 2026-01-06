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
import { AccountsReceivableGetResumeDataRequestDto } from '../dtos/request/accounts-receivable-get-resume-data-request.dto';
import { AccountsPayableGetAnalyticalDataRequestDto } from '../dtos/request/accounts-payable-get-analytical-data-request.dto';
import { AccountPayable } from '../entities/account-payable.entity';
import { AccountsPayableService } from '../services/accounts-payable.service';

@ApiTags('Financeiro')
@ApiBearerAuth(SWAGGER_API_SECURITY.BEARER_AUTH)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('finance/account-payable')
export class AccountsPayableController {
  constructor(
    private readonly dataSource: DataSource,
    private readonly accountsPayableService: AccountsPayableService,
  ) {}

  @ApiControllerDoc({
    summary: 'Titulos a Pagar: Ultima Atualização',
    successStatus: HttpStatus.OK,
    successDescription:
      'Retorna a data e hora da ultima atualização dos dados de devoluções.',
  })
  @Get('/last-update')
  @HttpCode(HttpStatus.OK)
  async getLastUpdatedAt() {
    const qb = this.dataSource
      .getRepository(AccountPayable)
      .createQueryBuilder('ap')
      .select(['ap.createdAt'])
      .where('1=1')
      .limit(1);

    const result = await qb.getOne();

    return {
      parsedUpdatedAt: DateUtils.format(result.createdAt, 'datetime'),
      updatedAt: result.createdAt,
    };
  }

  @ApiControllerDoc({
    summary: 'Titulos a Pagar: Listagem Analitica',
    successStatus: HttpStatus.OK,
    successDescription: 'Retorna uma listagem analitica dos titulos a pagar.',
  })
  @Get('analytical')
  @HttpCode(HttpStatus.OK)
  async getAnalyticalData(
    @Query() requestDto: AccountsPayableGetAnalyticalDataRequestDto,
  ) {
    return await this.accountsPayableService.getAnalyticalData(requestDto);
  }
}
