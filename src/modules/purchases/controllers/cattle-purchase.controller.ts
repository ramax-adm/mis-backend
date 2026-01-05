import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/user-roles.guard';
import { CattlePurchaseService } from '@/modules/purchases/services/cattle-purchase.service';
import { GetCattlePurchaseLastUpdatedAtResponseDto } from '@/modules/purchases/dtos/get-cattle-purchase-last-updated-at-response.dto';
import { NumberUtils } from '@/modules/utils/services/number.utils';
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
import { DataSource } from 'typeorm';
import { Response } from 'express';
import { ExportCattlePurchaseReportDto } from '@/modules/purchases/dtos/export-cattle-purchase-report.dto';
import { CattlePurchaseReportService } from '@/modules/purchases/services/cattle-purchase-report.service';
import {
  CATTLE_PURCHASE_CATTLE_ADVISOR,
  CATTLE_PURCHASE_CATTLE_CLASSIFICATION,
  CATTLE_PURCHASE_CATTLE_OWNERS,
} from '@/modules/purchases/constants/purchase';
import { CattlePurchaseTotals } from '../types/get-cattle-purchase.type';

@Controller('purchase/cattle-purchase')
export class CattlePurchaseController {
  constructor(
    private readonly datasource: DataSource,
    private readonly cattlePurchaseService: CattlePurchaseService,
    private readonly cattlePurchaseReportService: CattlePurchaseReportService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/resumed')
  @HttpCode(HttpStatus.OK)
  async getResumedData(
    @Query('companyCodes') companyCodes: string,
    @Query('startDate') startDate: Date | null = null,
    @Query('endDate') endDate: Date | null = null,
    @Query('cattleAdvisorName') cattleAdvisorName: string,
    @Query('cattleClassification') cattleClassification: string,
    @Query('cattleOwnerName') cattleOwnerName: string,
  ) {
    const { totals, kpis, ...rest } =
      await this.cattlePurchaseService.getResumeData({
        companyCodes: companyCodes?.split(','),
        startDate,
        endDate,
        cattleAdvisorName,
        cattleClassification,
        cattleOwnerName,
      });

    return {
      ...rest,
      kpis,
      totals: {
        cattleQuantity: NumberUtils.toLocaleString(totals.cattleQuantity),
        weightInArroba: NumberUtils.toLocaleString(totals.weightInArroba),
        weightInKg: NumberUtils.toLocaleString(totals.weightInKg),
        freightValue: NumberUtils.toLocaleString(totals.freightValue),
        purchaseValue: NumberUtils.toLocaleString(totals.purchaseValue),
        commissionValue: NumberUtils.toLocaleString(totals.commissionValue),
        finalValue: NumberUtils.toLocaleString(totals.finalValue),
        arrobaPrice: NumberUtils.toLocaleString(totals.arrobaPrice, 2),
        headPrice: NumberUtils.toLocaleString(totals.headPrice, 2),
        kgPrice: NumberUtils.toLocaleString(totals.kgPrice, 2),
        count: totals.count,
      },
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/cattle-owner')
  @HttpCode(HttpStatus.OK)
  async getCattlePurchaseCattleOwner(
    @Query('startDate') startDate: Date | null = null,
    @Query('endDate') endDate: Date | null = null,
  ) {
    const query = CATTLE_PURCHASE_CATTLE_OWNERS;

    const data = await this.datasource.query<{ cattle_owner_name: string }[]>(
      query,
      [startDate, endDate],
    );

    return data.map((i) => ({ cattleOwnerName: i.cattle_owner_name }));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/cattle-classification')
  @HttpCode(HttpStatus.OK)
  async getCattlePurchaseCattleClassification(
    @Query('startDate') startDate: Date | null = null,
    @Query('endDate') endDate: Date | null = null,
  ) {
    const query = CATTLE_PURCHASE_CATTLE_CLASSIFICATION;

    const data = await this.datasource.query<
      { cattle_classification: string }[]
    >(query, [startDate, endDate]);

    return data.map((i) => ({ cattleClassification: i.cattle_classification }));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/cattle-advisor')
  @HttpCode(HttpStatus.OK)
  async getCattlePurchaseCattleAdvisor(
    @Query('startDate') startDate: Date | null = null,
    @Query('endDate') endDate: Date | null = null,
  ) {
    const query = CATTLE_PURCHASE_CATTLE_ADVISOR;

    const data = await this.datasource.query<{ cattle_advisor_name: string }[]>(
      query,
      [startDate, endDate],
    );

    return data.map((i) => ({ cattleAdvisorName: i.cattle_advisor_name }));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/analytical')
  @HttpCode(HttpStatus.OK)
  async getAnalyticalData(
    @Query('companyCodes') companyCodes: string,
    @Query('cattleOwnerName') cattleOwnerName: string,
    @Query('cattleAdvisorName') cattleAdvisorName: string,
    @Query('cattleClassification') cattleClassification: string,
    @Query('purchaseCattleOrderId') purchaseCattleOrderId: string,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    const response = await this.cattlePurchaseService.getAnalyticalData({
      companyCodes: companyCodes?.split(','),
      cattleOwnerName,
      cattleAdvisorName,
      cattleClassification,
      purchaseCattleOrderId,
      startDate,
      endDate,
    });

    const totals: CattlePurchaseTotals = response.reduce(
      (acc, item) => ({
        cattleQuantity: acc.cattleQuantity + item.cattleQuantity,
        weightInArroba: acc.weightInArroba + item.cattleWeightInArroba,
        weightInKg: acc.weightInKg + item.cattleWeightInKg,
        freightValue: acc.freightValue + item.freightPrice,
        purchaseValue: acc.purchaseValue + item.purchasePrice,
        commissionValue: acc.commissionValue + item.commissionPrice,
        finalValue: acc.finalValue + item.totalValue,
        arrobaPrice: 0,
        headPrice: 0,
        kgPrice: 0,
        count: acc.count + 1,
      }),
      {
        cattleQuantity: 0,
        weightInArroba: 0,
        weightInKg: 0,
        freightValue: 0,
        purchaseValue: 0,
        commissionValue: 0,
        finalValue: 0,
        arrobaPrice: 0,
        headPrice: 0,
        kgPrice: 0,
        count: 0,
      },
    );

    // media
    totals.headPrice = totals.finalValue / totals.cattleQuantity;
    totals.arrobaPrice = totals.finalValue / totals.weightInArroba;
    totals.kgPrice = totals.finalValue / totals.weightInArroba / 15;

    return {
      parsedData: response.map((item) => item.toJSON()),
      originalData: response.map((item) => item),
      totals: {
        cattleQuantity: NumberUtils.toLocaleString(totals.cattleQuantity),
        weightInArroba: NumberUtils.toLocaleString(totals.weightInArroba),
        weightInKg: NumberUtils.toLocaleString(totals.weightInKg),
        freightValue: NumberUtils.toLocaleString(totals.freightValue),
        purchaseValue: NumberUtils.toLocaleString(totals.purchaseValue),
        commissionValue: NumberUtils.toLocaleString(totals.commissionValue),
        finalValue: NumberUtils.toLocaleString(totals.finalValue),
        arrobaPrice: NumberUtils.toLocaleString(totals.arrobaPrice, 2),
        headPrice: NumberUtils.toLocaleString(totals.headPrice, 2),
        kgPrice: NumberUtils.toLocaleString(totals.kgPrice, 2),
        count: totals.count,
      },
    };
  }

  @Get('/analytical/aggregated')
  @HttpCode(HttpStatus.OK)
  async getAggregatedAnalyticalData(
    @Query('companyCodes') companyCodes: string,
    @Query('cattleAdvisorName') cattleAdvisorName: string,
    @Query('cattleClassification') cattleClassification: string,
    @Query('cattleOwnerName') cattleOwnerName: string,
    @Query('purchaseCattleOrderId') purchaseCattleOrderId: string,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    const response =
      await this.cattlePurchaseService.getAggregatedAnalyticalData({
        companyCodes: companyCodes?.split(','),
        startDate,
        endDate,
        cattleAdvisorName,
        cattleClassification,
        cattleOwnerName,
        purchaseCattleOrderId,
      });

    const totals: CattlePurchaseTotals = {
      cattleQuantity: 0,
      weightInArroba: 0,
      weightInKg: 0,
      freightValue: 0,
      purchaseValue: 0,
      commissionValue: 0,
      finalValue: 0,
      arrobaPrice: 0,
      headPrice: 0,
      kgPrice: 0,
      count: 0,
    };

    for (const value of Object.values(response)) {
      totals.cattleQuantity += value.cattleQuantity;
      totals.weightInArroba += value.weightInArroba;
      totals.weightInKg += value.weightInKg;
      totals.freightValue += value.freightPrice;
      totals.purchaseValue += value.purchasePrice;
      totals.commissionValue += value.commissionPrice;
      totals.finalValue += value.totalValue;
      totals.arrobaPrice += value.arrobaPrice;
      totals.headPrice += value.headPrice;
      totals.kgPrice += value.kgPrice;
      totals.count += value.count;
    }

    // media
    totals.headPrice = totals.finalValue / totals.cattleQuantity;
    totals.arrobaPrice = totals.finalValue / totals.weightInArroba;
    totals.kgPrice = totals.finalValue / totals.weightInArroba / 15;

    return {
      data: response,
      totals: {
        cattleQuantity: NumberUtils.toLocaleString(totals.cattleQuantity),
        weightInArroba: NumberUtils.toLocaleString(totals.weightInArroba),
        weightInKg: NumberUtils.toLocaleString(totals.weightInKg),
        freightValue: NumberUtils.toLocaleString(totals.freightValue),
        purchaseValue: NumberUtils.toLocaleString(totals.purchaseValue),
        commissionValue: NumberUtils.toLocaleString(totals.commissionValue),
        finalValue: NumberUtils.toLocaleString(totals.finalValue),
        arrobaPrice: NumberUtils.toLocaleString(totals.arrobaPrice, 2),
        headPrice: NumberUtils.toLocaleString(totals.headPrice, 2),
        kgPrice: NumberUtils.toLocaleString(totals.kgPrice, 2),
        count: totals.count,
      },
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/export-xlsx')
  @HttpCode(HttpStatus.OK)
  async exportXLSX(
    @Body() dto: ExportCattlePurchaseReportDto,
    @Res() res: Response,
  ) {
    const result = await this.cattlePurchaseReportService.exportAnalytical(dto);

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    res.header(
      'Content-Disposition',
      `attachment; filename=${formattedDate}-cattle-purchase.xlsx`,
    );
    res.type(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.send(result);
  }
}
