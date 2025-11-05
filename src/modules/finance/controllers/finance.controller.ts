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
import { DataSource } from 'typeorm';
import { Response } from 'express';
import { ExportAccountsReceivablesReportDto } from '../dtos/request/export-accounts-receivable-request.dto';
import { FinanceReportTypeEnum } from '../enums/finance-report-type.enum';
import { AccountsReceivableReportService } from '../services/accounts-receivable-report.service';

@ApiTags('Financeiro')
@ApiBearerAuth(SWAGGER_API_SECURITY.BEARER_AUTH)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('finance')
export class FinanceController {
  constructor(
    private readonly dataSource: DataSource,
    private readonly accountsReceivableReportService: AccountsReceivableReportService,
  ) {}

  // EXPORT
  @Post('/export-xlsx/:type')
  @HttpCode(HttpStatus.OK)
  async exportXLSX(
    @Param('type') type: FinanceReportTypeEnum,
    @Body() exportDto: ExportAccountsReceivablesReportDto,
    @Res() res: Response,
  ) {
    let result;

    switch (type) {
      case FinanceReportTypeEnum.ACCOUNT_RECEIVABLE_ANALYTICAL: {
        result =
          await this.accountsReceivableReportService.exportAnalytical(
            exportDto,
          );
        break;
      }
      default: {
        throw new UnprocessableEntityException(
          'Não é possivel fazer a extração dos dados',
        );
      }
    }
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    res.header(
      'Content-Disposition',
      `attachment; filename=${formattedDate}-finance-${type ?? 'unknown'}.xlsx`,
    );
    res.type(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.send(result);
  }
}
