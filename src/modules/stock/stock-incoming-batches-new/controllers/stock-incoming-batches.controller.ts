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
import { DataSource } from 'typeorm';
import { StockIncomingBatchesService } from '../services/stock-incoming-batches.service';
import { IncomingBatches } from '@/core/entities/sensatta/incoming-batch.entity';
import { DateUtils } from '@/modules/utils/services/date.utils';

@Controller('stock/incoming-batches')
export class StockIncomingBatchesController {
  constructor(
    private readonly datasource: DataSource,
    private readonly stockIncomingBatchesService: StockIncomingBatchesService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/last-update')
  @HttpCode(HttpStatus.OK)
  async getStockLastUpdatedAt() {
    const qb = this.datasource
      .getRepository(IncomingBatches)
      .createQueryBuilder('sib');

    const { createdAt: lastUpdatedAt } = await qb
      .select('sib.createdAt')
      .getOne();

    return {
      updatedAt: lastUpdatedAt,
      parsedUpdatedAt: DateUtils.format(lastUpdatedAt, 'datetime'),
    };
  }

  @Get('resume')
  @HttpCode(HttpStatus.OK)
  async getResumeData(
    @Query('productLineCodes') productLineCodes?: string,
    @Query('market') market?: MarketEnum,
  ) {
    const data = await this.stockIncomingBatchesService.getResumedData({
      market,
      productLineCodes: productLineCodes?.split(','),
    });

    return data;
  }

  // @Get('filters/product-lines')
  // @HttpCode(HttpStatus.OK)
  // async getProductLines(
  // ) {
  //    const qb = this.datasource
  //     .getRepository(IncomingBatches)
  //     .createQueryBuilder('sib');

  //   return data;
  // }
}
