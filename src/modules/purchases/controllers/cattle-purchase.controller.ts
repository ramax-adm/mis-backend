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
    @Query('companyCode') companyCode: string,
    @Query('startDate') startDate: Date | null = null,
    @Query('endDate') endDate: Date | null = null,
  ) {
    const response = await this.cattlePurchaseService.getResumeData({
      companyCode,
      startDate,
      endDate,
    });

    return response;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/cattle-owner')
  @HttpCode(HttpStatus.OK)
  async getCattlePurchaseCattleOwner(
    @Query('companyCode') companyCode: string,
    @Query('startDate') startDate: Date | null = null,
    @Query('endDate') endDate: Date | null = null,
  ) {
    const query = CATTLE_PURCHASE_CATTLE_OWNERS;

    const data = await this.datasource.query<{ cattle_owner_name: string }[]>(
      query,
      [companyCode, startDate, endDate],
    );

    return data.map((i) => ({ cattleOwnerName: i.cattle_owner_name }));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/cattle-classification')
  @HttpCode(HttpStatus.OK)
  async getCattlePurchaseCattleClassification(
    @Query('companyCode') companyCode: string,
    @Query('startDate') startDate: Date | null = null,
    @Query('endDate') endDate: Date | null = null,
  ) {
    const query = CATTLE_PURCHASE_CATTLE_CLASSIFICATION;

    const data = await this.datasource.query<
      { cattle_classification: string }[]
    >(query, [companyCode, startDate, endDate]);

    return data.map((i) => ({ cattleClassification: i.cattle_classification }));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/cattle-advisor')
  @HttpCode(HttpStatus.OK)
  async getCattlePurchaseCattleAdvisor(
    @Query('companyCode') companyCode: string,
    @Query('startDate') startDate: Date | null = null,
    @Query('endDate') endDate: Date | null = null,
  ) {
    const query = CATTLE_PURCHASE_CATTLE_ADVISOR;

    const data = await this.datasource.query<{ cattle_advisor_name: string }[]>(
      query,
      [companyCode, startDate, endDate],
    );

    return data.map((i) => ({ cattleAdvisorName: i.cattle_advisor_name }));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/analytical')
  @HttpCode(HttpStatus.OK)
  async getAnalyticalData(
    @Query('companyCode') companyCode: string,
    @Query('cattleOwnerName') cattleOwnerName: string,
    @Query('cattleAdvisorName') cattleAdvisorName: string,
    @Query('cattleClassification') cattleClassification: string,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    const response = await this.cattlePurchaseService.getAnalyticalData({
      companyCode,
      cattleOwnerName,
      cattleAdvisorName,
      cattleClassification,
      startDate,
      endDate,
    });

    const totals = response.reduce(
      (acc, item) => ({
        cattleQuantity: acc.cattleQuantity + item.cattleQuantity,
        weightInArroba:
          acc.weightInArroba + item.cattleWeightInArroba * item.cattleQuantity,
        freightValue: acc.freightValue + item.freightPrice,
        purchaseValue: acc.purchaseValue + item.purchasePrice,
        commissionValue: acc.commissionValue + item.commissionPrice,
        finalValue: acc.finalValue + item.totalValue,
      }),
      {
        cattleQuantity: 0,
        weightInArroba: 0,
        freightValue: 0,
        purchaseValue: 0,
        commissionValue: 0,
        finalValue: 0,
      },
    );
    return {
      parsedData: response.map((item) => item.toJSON()),
      originalData: response.map((item) => item),
      totals: {
        cattleQuantity: NumberUtils.toLocaleString(totals.cattleQuantity),
        weightInArroba: NumberUtils.toLocaleString(totals.weightInArroba),
        freightValue: NumberUtils.toLocaleString(totals.freightValue, 2),
        purchaseValue: NumberUtils.toLocaleString(totals.purchaseValue, 2),
        commissionValue: NumberUtils.toLocaleString(totals.commissionValue, 2),
        finalValue: NumberUtils.toLocaleString(totals.finalValue, 2),
      },
    };
  }

  @Get('/analytical/aggregated')
  @HttpCode(HttpStatus.OK)
  async getAggregatedAnalyticalData(
    @Query('companyCode') companyCode: string,
    @Query('cattleAdvisorName') cattleAdvisorName: string,
    @Query('cattleClassification') cattleClassification: string,
    @Query('cattleOwnerName') cattleOwnerName: string,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    const response =
      await this.cattlePurchaseService.getAggregatedAnalyticalData({
        companyCode,
        startDate,
        endDate,
        cattleAdvisorName,
        cattleClassification,
        cattleOwnerName,
      });

    const totals = {
      cattleQuantity: 0,
      weightInArroba: 0,
      freightValue: 0,
      purchaseValue: 0,
      commissionValue: 0,
      finalValue: 0,
    };

    for (const value of Object.values(response)) {
      totals.cattleQuantity += value.cattleQuantity;
      totals.weightInArroba += value.weightInArroba;
      totals.freightValue += value.freightPrice;
      totals.purchaseValue += value.purchasePrice;
      totals.commissionValue += value.commissionPrice;
      totals.finalValue += value.totalValue;
    }

    return {
      data: response,
      totals: {
        cattleQuantity: NumberUtils.toLocaleString(totals.cattleQuantity),
        weightInArroba: NumberUtils.toLocaleString(totals.weightInArroba),
        freightValue: NumberUtils.toLocaleString(totals.freightValue, 2),
        purchaseValue: NumberUtils.toLocaleString(totals.purchaseValue, 2),
        commissionValue: NumberUtils.toLocaleString(totals.commissionValue, 2),
        finalValue: NumberUtils.toLocaleString(totals.finalValue, 2),
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
