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
import { DataSource } from 'typeorm';
import { BusinessAuditReturnOccurrencesService } from '../services/business-audit-return-occurrences.service';
import { ReturnOccurrence } from '@/modules/sales/entities/return-occurrence.entity';
import { BusinessAuditSalesService } from '../services/business-audit-sales.service';
import { OrderPriceConsiderationEnum } from '../enums/order-price-consideretion.enum';
import { MarketEnum } from '@/core/enums/sensatta/markets.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('business-audit/sales')
export class BusinessAuditSalesController {
  constructor(
    private readonly dataSource: DataSource,
    private readonly businessAuditSalesService: BusinessAuditSalesService,
  ) {}

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

  @Get()
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

  // GET RAW DATA
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
}
