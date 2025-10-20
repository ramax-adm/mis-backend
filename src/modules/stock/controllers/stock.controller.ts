import { Roles } from '@/core/decorators/user-roles.decorator';
import { UserRole } from '@/core/enums/user-role.enum';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/user-roles.guard';
import { DateUtils } from '@/modules/utils/services/date.utils';
import {
  Controller,
  UseGuards,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  Param,
  Post,
  Body,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { DataSource } from 'typeorm';
import { Company } from '@/core/entities/sensatta/company.entity';
import { StockService } from '../services/stock.service';
import { StockReportService } from '../services/stock-report.service';
import { GetStockLastUpdatedAtResponseDto } from '../dtos/response/stock-get-last-updated-at-response.dto';
import { GetStockByCompanyResponseDto } from '../dtos/response/stock-get-by-company-response.dto';
import { GetToExpiresByCompanyResponseDto } from '../dtos/response/stock-get-to-expires-by-company-response.dto';
import { GetAnalyticalStockByCompanyResponseDto } from '../dtos/response/stock-get-analytical-by-company-response.dto';
import { GetAnalyticalToExpiresByCompanyResponseDto } from '../dtos/response/stock-get-analytical-to-expires-by-company-response.dto';
import { ExportStockReportDto } from '../dtos/request/stock-export-report-request.dto';

@Controller('stock')
export class StockController {
  constructor(
    private readonly datasource: DataSource,
    private readonly stockService: StockService,
    private readonly stockReportService: StockReportService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/last-update')
  @HttpCode(200)
  async getStockLastUpdatedAt() {
    const response = await this.stockService.getStockLastUpdatedAt();

    return GetStockLastUpdatedAtResponseDto.create(response).toJSON();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  @HttpCode(HttpStatus.OK)
  async getResumedStockData() {
    const response = await this.stockService.getResumedStockData();

    return response.map((item) => {
      const stockData = item.stockData
        .sort((a, b) => Number(a.productCode) - Number(b.productCode))
        .map((item) => GetStockByCompanyResponseDto.create(item).toJSON());

      const toExpiresData = item.toExpiresData
        .sort(
          (a, b) =>
            DateUtils.toDate(a.dueDate).getTime() -
            DateUtils.toDate(b.dueDate).getTime(),
        )
        .map((item) => GetToExpiresByCompanyResponseDto.create(item).toJSON());

      return {
        ...item,
        stockData,
        toExpiresData,
      };
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/analytical')
  @HttpCode(HttpStatus.OK)
  async getAnalyticalStockData(@Query('companyCode') companyCode: string) {
    const response =
      await this.stockService.getAnalyticalStockData(companyCode);

    const stockData = response.stockData
      .sort((a, b) => Number(a.productCode) - Number(b.productCode))
      .map((item) =>
        GetAnalyticalStockByCompanyResponseDto.create(item).toJSON(),
      );

    const toExpiresData = response.toExpiresData
      .sort(
        (a, b) =>
          DateUtils.toDate(a.dueDate).getTime() -
          DateUtils.toDate(b.dueDate).getTime(),
      )
      .map((item) =>
        GetAnalyticalToExpiresByCompanyResponseDto.create(item).toJSON(),
      );

    return {
      ...response,
      stockData,
      toExpiresData,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('export-xlsx')
  @HttpCode(HttpStatus.OK)
  async exportXLSX(@Body() dto: ExportStockReportDto, @Res() res: Response) {
    const { exportType } = dto;

    let result;
    switch (exportType) {
      case 'analytical': {
        result = await this.stockReportService.exportAnalytical(dto);
        break;
      }

      case 'resumed': {
        result = await this.stockReportService.exportResumed(dto);
        break;
      }

      default:
        throw new BadRequestException('Escolha um relatorio valido.');
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    const company = await this.datasource
      .getRepository(Company)
      .createQueryBuilder('sc')
      .select('sc.name')
      .where('sc.sensatta_code = :companyCode', {
        companyCode: dto.filters?.companyCode,
      })
      .getOne();

    const formattedDate = `${year}-${month}-${day}`;
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    res.header(
      'Content-Disposition',
      `attachment; filename=${formattedDate}-${company?.name ?? ''}-stock-${exportType}.xlsx`,
    );
    res.type(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.send(result);
  }
}
