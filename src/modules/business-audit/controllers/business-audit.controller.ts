import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Res,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/user-roles.guard';
import { CONSIDERED_CFOPS } from '../constants/considered-cfops';
import { CONSIDERED_NF_SITUATIONS } from '../constants/considered-nf-situations';
import { Response } from 'express';
import { BusinessAuditReportTypeEnum } from '../enums/business-audit-report-type.enum';
import { BusinessAuditInvoiceTraceabilityReportService } from '../services/business-audit-invoice-traceability-report.service';
import { ExportBusinessAuditReportDto } from '../dtos/request/export-business-audit-report-request.dto';
import { BusinessAuditReturnOccurrencesReportService } from '../services/business-audit-return-occurrences-report.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('business-audit')
export class BusinessAuditController {
  constructor(
    // private readonly businessAuditSalesReportService: BusinessAuditSalesReportService,
    private readonly businessAuditInvoiceTraceabilityReportService: BusinessAuditInvoiceTraceabilityReportService,
    private readonly businessAuditReturnOccurrencesReportService: BusinessAuditReturnOccurrencesReportService,
  ) {}

  // FILTERS & CONSTANTS
  @Get('constants/considered-cfops')
  @HttpCode(HttpStatus.OK)
  getConsideredCfops() {
    return CONSIDERED_CFOPS;
  }

  @Get('constants/nf-situations')
  @HttpCode(HttpStatus.OK)
  getConsideredNfSituations() {
    return CONSIDERED_NF_SITUATIONS;
  }

  // EXPORT
  @Post('/export-xlsx/:type')
  @HttpCode(HttpStatus.OK)
  async exportXLSX(
    @Param('type') type: BusinessAuditReportTypeEnum,
    @Body() dto: ExportBusinessAuditReportDto,
    @Res() res: Response,
  ) {
    let result;

    switch (type) {
      case BusinessAuditReportTypeEnum.SALES: {
        result =
          await this.businessAuditInvoiceTraceabilityReportService.export(dto);
        break;
      }
      case BusinessAuditReportTypeEnum.RETURN_OCCURRENCES: {
        result =
          await this.businessAuditReturnOccurrencesReportService.exportReturnOccurrences(
            dto,
          );
        break;
      }
      case BusinessAuditReportTypeEnum.INVOICE_TRACEABILITY: {
        result =
          await this.businessAuditInvoiceTraceabilityReportService.export(dto);
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
      `attachment; filename=${formattedDate}-business-audit-${type ?? 'unknown'}.xlsx`,
    );
    res.type(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.send(result);
  }
}
