import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BusinessAuditService } from '../services/business-audit.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/user-roles.guard';
import { CONSIDERED_CFOPS } from '../constants/considered-cfops';
import { CONSIDERED_NF_SITUATIONS } from '../constants/considered-nf-situations';
import { OrderPriceConsiderationEnum } from '../enums/order-price-consideretion.enum';
import { MarketEnum } from '@/core/enums/sensatta/markets.enum';

@Controller('business-audit')
export class BusinessAuditController {
  constructor(private readonly businessAuditService: BusinessAuditService) {}

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
  @Get('overview')
  @HttpCode(HttpStatus.OK)
  async getOverviewData(
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    return await this.businessAuditService.getOverviewData({
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
  ) {
    return await this.businessAuditService.getSalesAuditData({
      startDate,
      endDate,
      priceConsideration,
      market,
      companyCodes: companyCodes?.split(','),
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
    @Query('clientCode') clientCode?: string,
    @Query('salesRepresentativeCode') salesRepresentativeCode?: string,
  ) {
    return await this.businessAuditService.getOrdersLines({
      startDate,
      endDate,
      nfNumber,
      nfId,
      productCode,
      clientCode,
      salesRepresentativeCode,
    });
  }
}
