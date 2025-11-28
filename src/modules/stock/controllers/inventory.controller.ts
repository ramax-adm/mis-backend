import { SWAGGER_API_SECURITY } from '@/core/constants/swagger-security';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/user-roles.guard';
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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InventoryService } from '../services/inventory.service';
import { ApiControllerDoc } from '@/core/decorators/api-doc.decorator';
import { DataSource } from 'typeorm';
import { Invoice } from '@/modules/sales/entities/invoice.entity';
import { Inventory } from '../entities/inventory.entity';
import { DateUtils } from '@/modules/utils/services/date.utils';
import { InventoryGetAnalyticalDataRequestDto } from '../dtos/request/inventory-get-analytical-data-request.dto';
import { InventoryItem } from '../entities/inventory-item.entity';
import { InventoryGetLastUpdatedAtResponseDto } from '../dtos/response/inventory-get-last-updated-at-response.dto';
import { InventoryGetResumeDataRequestDto } from '../dtos/request/inventory-get-resume-data-request.dto';
import {
  FilterOption,
  FilterOptionsType,
} from '@/core/types/filter-option.type';
import { InventoryGetResumeDataResponseDto } from '../dtos/response/inventory-get-resume-data-response.dto';
import { InventoryGetAnalyticalDataResponseDto } from '../dtos/response/inventory-get-analytical-data-response.dto';
import { Response } from 'express';
import { InventoryExportReportRequestDto } from '../dtos/request/inventory-export-report-request.dto';
import { InventoryReportService } from '../services/inventory-report.service';

@ApiTags('Inventário')
@ApiBearerAuth(SWAGGER_API_SECURITY.BEARER_AUTH)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('stock/inventory')
export class InventoryController {
  // Inventory controller methods would go here
  constructor(
    private readonly dataSource: DataSource,
    private readonly inventoryService: InventoryService,
    private readonly inventoryReportService: InventoryReportService,
  ) {}

  // last updated at
  @ApiControllerDoc({
    summary: 'Inventario: Ultima atualização',
    description:
      'Responsavel por retornar a ultima atualização dos dados do inventario.',
    successStatus: HttpStatus.OK,
    successDescription:
      'Retorna a data e o timestamp da ultima atualização dos dados.',
    successType: InventoryGetLastUpdatedAtResponseDto,
  })
  @Get('/last-update')
  @HttpCode(HttpStatus.OK)
  async getLastUpdatedAt() {
    const qb = this.dataSource
      .createQueryBuilder()
      .select(['sii.created_at'])
      .from(Inventory, 'sii')
      .where('1=1')
      .limit(1);

    const result = await qb.getRawOne<{
      created_at: Date;
    }>();

    return new InventoryGetLastUpdatedAtResponseDto({
      parsedUpdatedAt: DateUtils.format(result.created_at, 'datetime'),
      updatedAt: result.created_at,
    });
  }

  @ApiControllerDoc({
    summary: 'Filtro: Almoxarifados',
    description:
      'Responsavel por retornar a listagem de almoxarifados disponiveis para filtragem.',
    successStatus: HttpStatus.OK,
    successDescription:
      'Retorna uma lista de almoxarifados para servir como filtragem no front-end.',
    successType: Array<FilterOption>,
  })
  @Get('filters/warehouses')
  @HttpCode(HttpStatus.OK)
  async getWarehouses(@Query('companyCode') companyCode?: string) {
    const qb = this.dataSource
      .createQueryBuilder(Inventory, 'inv')
      .select([
        'inv.warehouse_code as warehouse_code',
        'inv.warehouse as warehouse',
      ])
      .distinct(true)
      .where('1=1');

    if (companyCode) {
      qb.andWhere('inv.company_code = :companyCode', { companyCode });
    }

    const data = await qb
      .orderBy('inv.warehouse_code', 'ASC')
      .getRawMany<{ warehouse_code: string; warehouse: string }>();

    return data.map((item) => ({
      id: item.warehouse_code,
      name: `${item.warehouse_code} - ${item.warehouse}`,
      key: item.warehouse_code,
    }));
  }

  @ApiControllerDoc({
    summary: 'Filtro: Inventários',
    description:
      'Responsavel por retornar a listagem de inventarios disponiveis para filtragem.',
    successStatus: HttpStatus.OK,
    successDescription:
      'Retorna uma lista de inventários para servir como filtragem no front-end.',
    successType: Array<FilterOption>,
  })
  @Get('filters/inventories')
  @HttpCode(HttpStatus.OK)
  async getInventories(@Query('companyCode') companyCode?: string) {
    const qb = this.dataSource
      .createQueryBuilder(Inventory, 'inv')
      .select(['inv.sensatta_id as inventory_id', 'inv.date as date'])
      .distinct(true)
      .where('1=1');

    if (companyCode) {
      qb.andWhere('inv.company_code = :companyCode', { companyCode });
    }

    const data = await qb
      .orderBy('inv.date', 'DESC')
      .getRawMany<{ inventory_id: string; date: Date }>();

    return data.map((item) => ({
      label: `${DateUtils.format(item.date, 'date')} - ${item.inventory_id}`,
      value: item.inventory_id,
      key: item.inventory_id,
    }));
  }

  @ApiControllerDoc({
    summary: 'Inventario: Listagem Analitica',
    description:
      'Responsavel por retornar os dados c/ disposição analitica sobre o inventario',
    successStatus: HttpStatus.OK,
    successDescription: 'Retorna os dados do inventario.',
    successType: InventoryGetAnalyticalDataResponseDto,
  })
  @Get('analytical')
  @HttpCode(HttpStatus.OK)
  async getAnalyticalData(
    @Query() requestDto: InventoryGetAnalyticalDataRequestDto,
  ) {
    const response = await this.inventoryService.getAnalyticalData(requestDto);

    return response;
  }

  @ApiControllerDoc({
    summary: 'Inventario: Listagem Resumida',
    description:
      'Responsavel por retornar os dados c/ disposição resumida sobre o inventario',
    successStatus: HttpStatus.OK,
    successDescription: 'Retorna os dados do inventario.',
    successType: InventoryGetResumeDataResponseDto,
  })
  @Get('resume')
  @HttpCode(HttpStatus.OK)
  async getResumeData(@Query() requestDto: InventoryGetResumeDataRequestDto) {
    const response = await this.inventoryService.getResumeData(requestDto);

    return response;
  }

  @ApiControllerDoc({
    summary: 'Inventario: Export XLSX',
    description:
      'Responsavel por criar um arquivo em excel com base nos dados e retorna-lo.',
    successStatus: HttpStatus.OK,
    successDescription: 'Retorna os dados do inventario.',
    successContentType: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        schema: { type: 'string', format: 'binary' },
      },
    },
  })
  @Post('export-xlsx/:type')
  @HttpCode(HttpStatus.OK)
  async exportXLSX(
    @Param('type') type: string,
    @Body() dto: InventoryExportReportRequestDto,
    @Res() res: Response,
  ) {
    let result;
    switch (type) {
      case 'analytical': {
        result = await this.inventoryReportService.exportAnalytical(dto);
        break;
      }

      case 'resumed': {
        result = await this.inventoryReportService.exportResumed(dto);
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
      `attachment; filename=${formattedDate}-inventory-${type}.xlsx`,
    );
    res.type(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.send(result);
  }
}
