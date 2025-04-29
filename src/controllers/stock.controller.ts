import { JwtAuthGuard } from '@/services/auth/guards/jwt-auth.guard';
import { GetAnalyticalStockByCompanyResponseDto } from '@/services/stock/dto/get-analytical-stock-by-company-response.dto';
import { GetAnalyticalToExpiresByCompanyResponseDto } from '@/services/stock/dto/get-analytical-to-expires-by-company-response.dto';
import { GetStockByCompanyResponseDto } from '@/services/stock/dto/get-stock-by-company-response.dto';
import { GetStockLastUpdatedAtResponseDto } from '@/services/stock/dto/get-stock-last-updated-at-response.dto';
import { GetToExpiresByCompanyResponseDto } from '@/services/stock/dto/get-to-expires-by-company-response.dto';
import { StockReportService } from '@/services/stock/stock-report.service';
import { StockService } from '@/services/stock/stock.service';
import { DateUtils } from '@/services/utils/date.utils';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { ExportStockReportDto } from '../services/stock/dto/export-stock-report.dto';
import { RolesGuard } from '@/services/auth/guards/user-roles.guard';
import { Roles } from '@/common/decorators/user-roles.decorator';
import { UserRole } from '@/common/enums/user-role.enum';

@Controller('stock')
export class StockController {
  constructor(
    private readonly stockService: StockService,
    private readonly stockReportService: StockReportService,
  ) {}

  @Roles(...[UserRole.Commercial, UserRole.Directory])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/last-update')
  @HttpCode(200)
  async getStockLastUpdatedAt() {
    const response = await this.stockService.getStockLastUpdatedAt();

    return GetStockLastUpdatedAtResponseDto.create(response).toJSON();
  }

  @Roles(...[UserRole.Commercial, UserRole.Directory])
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
        .filter((item) => item.daysToExpires >= 0)
        .map((item) => GetToExpiresByCompanyResponseDto.create(item).toJSON());

      return {
        ...item,
        stockData,
        toExpiresData,
      };
    });
  }

  @Roles(...[UserRole.Commercial, UserRole.Directory])
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
      .filter((item) => item.daysToExpires >= 0)
      .map((item) =>
        GetAnalyticalToExpiresByCompanyResponseDto.create(item).toJSON(),
      );

    return {
      ...response,
      stockData,
      toExpiresData,
    };
  }

  @Roles(...[UserRole.Commercial, UserRole.Directory])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':companyCode')
  @HttpCode(HttpStatus.OK)
  async getResumedStockByCompany(@Param('companyCode') companyCode: string) {
    const response = await this.stockService.getResumedStockByCompany(
      companyCode,
      {},
    );

    return response
      .sort((a, b) => Number(a.productCode) - Number(b.productCode))
      .map((item) => GetStockByCompanyResponseDto.create(item).toJSON());
  }

  @Roles(...[UserRole.Commercial, UserRole.Directory])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':companyCode/analytical')
  @HttpCode(HttpStatus.OK)
  async getAnalyticalStockByCompany(@Param('companyCode') companyCode: string) {
    const response = await this.stockService.getAnalyticalStockByCompany(
      companyCode,
      {},
    );

    return response
      .sort((a, b) => Number(a.productCode) - Number(b.productCode))
      .map((item) =>
        GetAnalyticalStockByCompanyResponseDto.create(item).toJSON(),
      );
  }

  @Roles(...[UserRole.Commercial, UserRole.Directory])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':companyCode/to-expires')
  @HttpCode(HttpStatus.OK)
  async getResumedToExpiresByCompany(
    @Param('companyCode') companyCode: string,
  ) {
    const response = await this.stockService.getResumedToExpiresByCompany(
      companyCode,
      {},
    );

    return response
      .sort(
        (a, b) =>
          DateUtils.toDate(a.dueDate).getTime() -
          DateUtils.toDate(b.dueDate).getTime(),
      )
      .filter((item) => item.daysToExpires >= 0)
      .map((item) => GetToExpiresByCompanyResponseDto.create(item).toJSON());
  }

  @Roles(...[UserRole.Commercial, UserRole.Directory])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':companyCode/analytical/to-expires')
  @HttpCode(HttpStatus.OK)
  async getAnalyticalToExpiresByCompany(
    @Param('companyCode') companyCode: string,
  ) {
    const response = await this.stockService.getAnalyticalToExpiresByCompany(
      companyCode,
      {},
    );

    return response
      .sort((a, b) => Number(a.productCode) - Number(b.productCode))
      .map((item) =>
        GetAnalyticalToExpiresByCompanyResponseDto.create(item).toJSON(),
      );
  }

  @Roles(...[UserRole.Commercial, UserRole.Directory])
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
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}-${hours}-${minutes}-${seconds}`;
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    res.header(
      'Content-Disposition',
      `attachment; filename=${formattedDate}-stock-${exportType}.xlsx`,
    );
    res.type(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.send(result);
  }
}
