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
import { MarketEnum } from '@/core/enums/sensatta/markets.enum';
import { Response } from 'express';
import { BusinessAuditReportTypeEnum } from '../enums/business-audit-report-type.enum';
import { BusinessAuditSalesService } from '../services/business-audit-sales.service';
import { BusinessAuditSalesReportService } from '../services/business-audit-sales-report.service';
import { ExportBusinessAuditReportDto } from '../dtos/request/export-business-audit-report-request.dto';
import { DataSource } from 'typeorm';
import { BusinessAuditReturnOccurrencesService } from '../services/business-audit-return-occurrences.service';

@Controller('business-audit')
export class BusinessAuditController {
  constructor(
    private readonly dataSource: DataSource,
    private readonly businessAuditSalesReportService: BusinessAuditSalesReportService,
    private readonly businessAuditSalesService: BusinessAuditSalesService,
    private readonly businessAuditReturnOccurrencesService: BusinessAuditReturnOccurrencesService,
    private readonly businessAuditOverviewService: BusinessAuditOverviewService,
  ) {}

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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('filters/clients')
  @HttpCode(HttpStatus.OK)
  async getClients(
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('priceConsideration')
    priceConsideration?: OrderPriceConsiderationEnum,
    @Query('market') market?: MarketEnum,
    @Query('companyCodes') companyCodes?: string,
  ) {
    const results = await this.businessAuditSalesService.getClients({
      startDate,
      endDate,
      market,
      priceConsideration,
      companyCodes: companyCodes.split(','),
    });
    return results.map((i) => ({
      key: i.so_client_code,
      label: i.so_client_name,
      value: i.so_client_code,
    }));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('filters/sales-representatives')
  @HttpCode(HttpStatus.OK)
  async getSalesRepresentatives(
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('priceConsideration')
    priceConsideration?: OrderPriceConsiderationEnum,
    @Query('market') market?: MarketEnum,
    @Query('companyCodes') companyCodes?: string,
  ) {
    // dos dados que ja foram filtrados, pego apenas o set de clientes

    const results = await this.businessAuditSalesService.getRepresentatives({
      startDate,
      endDate,
      market,
      priceConsideration,
      companyCodes: companyCodes.split(','),
    });
    return results.map((i) => ({
      key: i.so_sales_representative_code,
      label: i.so_sales_representative_name,
      value: i.so_sales_representative_code,
    }));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('overview')
  @HttpCode(HttpStatus.OK)
  async getOverviewData(
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    return await this.businessAuditOverviewService.getOverviewData({
      startDate,
      endDate,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('sales')
  @HttpCode(HttpStatus.OK)
  async getSalesAuditData(
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('priceConsideration')
    priceConsideration?: OrderPriceConsiderationEnum,
    @Query('market') market?: MarketEnum,
    @Query('companyCodes') companyCodes?: string,
    @Query('clientCodes') clientCodes?: string,
    @Query('salesRepresentativeCodes') salesRepresentativeCodes?: string,
  ) {
    return await this.businessAuditSalesService.getSalesAuditData({
      startDate,
      endDate,
      priceConsideration,
      market,
      companyCodes: companyCodes?.split(','),
      clientCodes: clientCodes?.split(','),
      salesRepresentativeCodes: salesRepresentativeCodes?.split(','),
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('data/orders-lines')
  @HttpCode(HttpStatus.OK)
  async getOrderLinesData(
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('nfNumber') nfNumber?: string,
    @Query('nfId') nfId?: string,
    @Query('productCode') productCode?: string,
    @Query('clientCodes') clientCodes?: string,
    @Query('salesRepresentativeCodes') salesRepresentativeCodes?: string,
  ) {
    return await this.businessAuditSalesService.getOrdersLines({
      startDate,
      endDate,
      nfNumber,
      nfId,
      productCode,
      clientCodes: clientCodes?.split(','),
      salesRepresentativeCodes: salesRepresentativeCodes?.split(','),
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('return-occurrences')
  @HttpCode(HttpStatus.OK)
  async getReturnOccurrencesAuditData(
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('occurrenceNumber') occurrenceNumber?: string,
    @Query('companyCodes') companyCodes?: string,
    @Query('occurrenceCauses') occurrenceCauses?: string,
    @Query('returnTypes') returnTypes?: string,
  ) {
    return await this.businessAuditReturnOccurrencesService.getData({
      startDate,
      endDate,
      occurrenceNumber,
      companyCodes: companyCodes?.split(','),
      occurrenceCauses: occurrenceCauses?.split(','),
      returnTypes: returnTypes?.split(','),
    });
  }

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
