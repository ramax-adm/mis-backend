import { SWAGGER_API_SECURITY } from '@/core/constants/swagger-security';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/user-roles.guard';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InventoryService } from '../services/inventory.service';
import { ApiControllerDoc } from '@/core/decorators/api-doc.decorator';
import { DataSource } from 'typeorm';
import { Invoice } from '@/modules/sales/entities/invoice.entity';
import { Inventory } from '../entities/inventory.entity';
import { DateUtils } from '@/modules/utils/services/date.utils';

@ApiTags('Inventário')
@ApiBearerAuth(SWAGGER_API_SECURITY.BEARER_AUTH)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('stock/inventory')
export class InventoryController {
  // Inventory controller methods would go here
  constructor(
    private readonly dataSource: DataSource,
    private readonly inventoryService: InventoryService,
  ) {}

  @ApiControllerDoc({
    summary: 'Filtro: Almoxarifados',
    successStatus: HttpStatus.OK,
    successDescription:
      'Retorna uma lista de almoxarifados para servir como filtragem no front-end.',
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

    console.log({ data });

    return data.map((item) => ({
      id: item.warehouse_code,
      name: `${item.warehouse_code} - ${item.warehouse}`,
      key: item.warehouse_code,
    }));
  }

  @ApiControllerDoc({
    summary: 'Filtro: Inventários',
    successStatus: HttpStatus.OK,
    successDescription:
      'Retorna uma lista de inventários para servir como filtragem no front-end.',
  })
  @Get('filters/inventories')
  @HttpCode(HttpStatus.OK)
  async getInventories(
    @Query('companyCode') companyCode?: string,
    @Query('warehouseCode') warehouseCode?: string,
  ) {
    const qb = this.dataSource
      .createQueryBuilder(Inventory, 'inv')
      .select(['inv.sensatta_id as inventory_id', 'inv.date as date'])
      .distinct(true)
      .where('1=1');

    if (companyCode) {
      qb.andWhere('inv.company_code = :companyCode', { companyCode });
    }

    if (warehouseCode) {
      qb.andWhere('inv.warehouse_code = :warehouseCode', { warehouseCode });
    }

    const data = await qb
      .orderBy('inv.date', 'DESC')
      .getRawMany<{ inventory_id: string; date: Date }>();

    console.log({ data });

    return data.map((item) => ({
      id: item.inventory_id,
      name: `${DateUtils.format(item.date, 'date')} - ${item.inventory_id}`,
      key: item.inventory_id,
    }));
  }
}
