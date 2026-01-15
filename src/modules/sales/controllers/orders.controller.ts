import {
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
import { InvoicesNfTypesEnum } from '../enums/invoices-nf-types.enum';
import { InvoicesSituationsEnum } from '../enums/invoices-situations.enum';
import { SalesInvoicesService } from '../services/sales-invoices.service';
import { DataSource } from 'typeorm';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/user-roles.guard';
import { DateUtils } from '@/modules/utils/services/date.utils';
import { HttpService } from '@nestjs/axios';
import { EnvService } from '@/config/env/env.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ReturnOccurrencesService } from '../services/return-occurrences.service';
import { GetReturnOccurrencesAnalyticalDataRequestDto } from '../dtos/request/return-occurrences-get-analytical-data-request.dto';
import { ApiControllerDoc } from '@/core/decorators/api-doc.decorator';
import { SWAGGER_API_SECURITY } from '@/core/constants/swagger-security';
import { ReturnOccurrence } from '../entities/return-occurrence.entity';
import { OrdersService } from '../services/orders.service';
import { GetOrdersAnalyticalDataRequestDto } from '../dtos/request/orders-get-analytical-data-request.dto';
import { OrderLine } from '../entities/order-line.entity';

@ApiTags('Pedidos')
@ApiBearerAuth(SWAGGER_API_SECURITY.BEARER_AUTH)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sales/orders')
export class OrdersController {
  constructor(
    private readonly dataSource: DataSource,
    private readonly ordersService: OrdersService,
  ) {}

  @ApiControllerDoc({
    summary: 'Pedidos: Ultima atualização',
    successStatus: HttpStatus.OK,
    successDescription:
      'Retorna a data e hora da ultima atualização dos dados de pedidos.',
  })
  @Get('/last-update')
  @HttpCode(HttpStatus.OK)
  async getLastUpdatedAt() {
    const qb = this.dataSource
      .createQueryBuilder()
      .select(['so.created_at'])
      .from('sensatta_order_lines', 'so')
      .where('1=1')
      .limit(1);

    const result = await qb.getRawOne<{
      created_at: Date;
    }>();

    return {
      parsedUpdatedAt: DateUtils.format(result.created_at, 'datetime'),
      updatedAt: result.created_at,
    };
  }

  @ApiControllerDoc({
    summary: 'Filtro: Motivos de Ocorrência',
    successStatus: HttpStatus.OK,
    successDescription:
      'Retorna uma lista de situações para servir como filtragem no front-end.',
  })
  @Get('filters/situations')
  @HttpCode(HttpStatus.OK)
  async getOrdersSituations() {
    const results = await this.dataSource
      .getRepository(OrderLine)
      .createQueryBuilder('so')
      .select(['so.situation'])
      .distinctOn(['so.situation'])
      .getMany();
    return results.map((i) => ({
      key: i.situation,
      label: i.situation,
      value: i.situation,
    }));
  }

  @ApiControllerDoc({
    summary: 'Pedidos: Listagem Analitica',
    successStatus: HttpStatus.OK,
    successDescription: 'Retorna os dados dos pedidos e seus totais',
  })
  @Get('analytical')
  @HttpCode(HttpStatus.OK)
  async getAnalyticalData(
    @Query() requestQuery: GetOrdersAnalyticalDataRequestDto,
  ) {
    return await this.ordersService.getAnalyticalData(requestQuery);
  }

  @ApiControllerDoc({
    summary: 'Pedidos: Listagem Analitica',
    successStatus: HttpStatus.OK,
    successDescription: 'Retorna os dados dos pedidos e seus totais',
  })
  @Get(':orderId')
  @HttpCode(HttpStatus.OK)
  async getOne(@Param('orderId') orderId: string) {
    return await this.ordersService.getOrderLines({ orderId });
  }
}
