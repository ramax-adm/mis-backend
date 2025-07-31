import { Roles } from '@/core/decorators/user-roles.decorator';
import { StockBalance } from '@/modules/stock/stock-balance/entities/stock-balance.entity';
import { MarketEnum } from '@/core/enums/sensatta/markets.enum';
import { UserRole } from '@/core/enums/user-role.enum';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/user-roles.guard';
import { ExportStockBalanceReportDto } from '@/modules/stock/stock-balance/dtos/export-stock-new-report.dto';
import { GetStockNewLastUpdatedAtResponseDto } from '@/modules/stock/stock-balance/dtos/get-stock-new-last-updated-at-response.dto';
import { StockBalanceReportService } from '@/modules/stock/stock-balance/services/stock-balance-report.service';
import { StockBalanceService } from '@/modules/stock/stock-balance/services/stock-balance.service';
import {
  BadRequestException,
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
import { Response } from 'express';

@Controller('stock-balance')
export class StockBalanceController {
  constructor(
    private readonly stockBalanceService: StockBalanceService,
    private readonly stockBalanceReportService: StockBalanceReportService,
  ) {}

  @Roles(...[UserRole.Commercial, UserRole.Directory, UserRole.Industry])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/last-update')
  @HttpCode(200)
  async getStockLastUpdatedAt() {
    const response = await this.stockBalanceService.getStockLastUpdatedAt();

    return GetStockNewLastUpdatedAtResponseDto.create(response).toJSON();
  }

  @Get('analytical')
  @HttpCode(HttpStatus.OK)
  async getAnalyticalData(
    @Query('companyCode') companyCode: string,
    @Query('productLineCode') productLineCode?: string,
    @Query('market') market: MarketEnum = MarketEnum.BOTH,
  ) {
    return await this.stockBalanceService.getAnalyticalData({
      companyCode,
      productLineCode,
      market,
    });
  }

  @Get('analytical/aggregated')
  @HttpCode(HttpStatus.OK)
  async getAggregatedAnalyticalData(
    @Query('key') key: keyof StockBalance,
    @Query('companyCode') companyCode: string,
    @Query('productLineCode') productLineCode?: string,
    @Query('market') market: MarketEnum = MarketEnum.BOTH,
  ) {
    if (!key) {
      throw new BadRequestException('Provide a grouping key');
    }
    const data = await this.stockBalanceService.getAggregatedAnalyticalData(
      key,
      {
        companyCode,
        productLineCode,
        market,
      },
    );

    return data;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/export-xlsx')
  @HttpCode(HttpStatus.OK)
  async exportXLSX(
    @Body() dto: ExportStockBalanceReportDto,
    @Res() res: Response,
  ) {
    const result = await this.stockBalanceReportService.exportAnalytical(dto);

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    res.header(
      'Content-Disposition',
      `attachment; filename=${formattedDate}-stock-balance.xlsx`,
    );
    res.type(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.send(result);
  }
}
