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
import { BusinessAuditOverviewService } from '../services/business-audit-overview.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/user-roles.guard';
import { CONSIDERED_CFOPS } from '../constants/considered-cfops';
import { CONSIDERED_NF_SITUATIONS } from '../constants/considered-nf-situations';
import { OrderPriceConsiderationEnum } from '../enums/order-price-consideretion.enum';
import { MarketEnum } from '@/modules/stock/enums/markets.enum';
import { Response } from 'express';
import { BusinessAuditReportTypeEnum } from '../enums/business-audit-report-type.enum';
import { BusinessAuditSalesService } from '../services/business-audit-sales.service';
import { BusinessAuditSalesReportService } from '../services/business-audit-sales-report.service';
import { ExportBusinessAuditReportDto } from '../dtos/request/export-business-audit-report-request.dto';
import { DataSource } from 'typeorm';
import { BusinessAuditReturnOccurrencesService } from '../services/business-audit-return-occurrences.service';
import { ReturnOccurrence } from '@/modules/sales/entities/return-occurrence.entity';
import { BusinessAuditReturnOccurrencesReportService } from '../services/business-audit-return-occurrences-report.service';

@Controller('business-audit')
export class BusinessAuditController {
  constructor(
    private readonly businessAuditSalesReportService: BusinessAuditSalesReportService,
    private readonly businessAuditReturnOccurrencesReportService: BusinessAuditReturnOccurrencesReportService,
  ) {}

  // FILTERS & CONSTANTS
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('constants/considered-cfops')
  @HttpCode(HttpStatus.OK)
  getConsideredCfops() {
    return CONSIDERED_CFOPS;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('constants/nf-situations')
  @HttpCode(HttpStatus.OK)
  getConsideredNfSituations() {
    return CONSIDERED_NF_SITUATIONS;
  }

  // EXPORT
  @UseGuards(JwtAuthGuard, RolesGuard)
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
          await this.businessAuditSalesReportService.exportSalesByInvoice(dto);
        break;
      }
      case BusinessAuditReportTypeEnum.RETURN_OCCURRENCES: {
        result =
          await this.businessAuditReturnOccurrencesReportService.exportSalesByInvoice(
            dto,
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
      `attachment; filename=${formattedDate}-business-audit-${type ?? 'unknown'}.xlsx`,
    );
    res.type(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.send(result);
  }
}
