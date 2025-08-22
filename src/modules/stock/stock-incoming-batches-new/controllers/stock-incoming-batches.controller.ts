import { MarketEnum } from '@/core/enums/sensatta/markets.enum';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/user-roles.guard';
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
import { ExportStockIncomingBatchesReportRequestDto } from '../dtos/request/export-stock-incoming-batches-report-request.dto';
import { StockIncomingBatchesReportService } from '../services/stock-incoming-batches-report.service';

@Controller('stock/incoming-batches')
export class StockIncomingBatchesController {
  constructor(
    private readonly datasource: DataSource,
    private readonly stockIncomingBatchesService: StockIncomingBatchesService,
    private readonly stockIncomingBatchesReportService: StockIncomingBatchesReportService,
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

  @UseGuards(JwtAuthGuard, RolesGuard)
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('analytical')
  @HttpCode(HttpStatus.OK)
  async getAnalyticalData(
    @Query('companyCode') companyCode: string,
    @Query('productLineCodes') productLineCodes?: string,
    @Query('market') market?: MarketEnum,
  ) {
    const data = await this.stockIncomingBatchesService.getAnalyticalData({
      companyCode,
      market,
      productLineCodes: productLineCodes?.split(','),
    });

    return data;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('filters/product-lines')
  @HttpCode(HttpStatus.OK)
  async getProductLines(@Query('market') market?: MarketEnum) {
    const qb = this.datasource
      .createQueryBuilder()
      .select([
        'spl.sensatta_code AS product_line_code',
        'spl.acronym AS acronym',
        'spl.name AS product_line_name',
      ])
      .from('sensatta_incoming_batches', 'sib')
      .leftJoin(
        'sensatta_product_lines',
        'spl',
        'spl.sensatta_code = sib.product_line_code',
      )
      .distinct(true)
      .where('1=1')
      .andWhere('spl.is_considered_on_stock = true');

    if (market) {
      qb.andWhere('spl.market =:market', { market });
    }

    const data = await qb.getRawMany<{
      product_line_code: string;
      acronym: string;
      product_line_name: string;
    }>();

    return data
      .sort((a, b) => Number(a.product_line_code) - Number(b.product_line_code))
      .map((i) => ({
        key: `${i.product_line_code}-${i.acronym}`,
        value: `${i.product_line_code}-${i.acronym}`,
        label: `${i.product_line_code} - ${i.product_line_name}`,
      }));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('export-xlsx')
  @HttpCode(HttpStatus.OK)
  async exportXLSX(
    @Body() dto: ExportStockIncomingBatchesReportRequestDto,
    @Res() res: Response,
  ) {
    const { exportType } = dto;

    let result;
    switch (exportType) {
      case 'analytical': {
        result =
          await this.stockIncomingBatchesReportService.exportAnalytical(dto);
        break;
      }

      case 'resumed': {
        result =
          await this.stockIncomingBatchesReportService.exportResumed(dto);
        break;
      }

      default:
        throw new BadRequestException('Escolha um relatorio valido.');
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    res.header(
      'Content-Disposition',
      `attachment; filename=${formattedDate}-stock-incoming-batches-${exportType}.xlsx`,
    );
    res.type(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.send(result);
  }
}
