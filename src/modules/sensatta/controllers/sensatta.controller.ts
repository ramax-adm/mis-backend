import { PRODUCT_CLASSIFICATION_TYPES } from '@/core/constants/sensatta/product-classification-types';
import { Company } from '@/core/entities/sensatta/company.entity';
import { ProductLine } from '@/core/entities/sensatta/product-line.entity';
import { Product } from '@/core/entities/sensatta/product.entity';
import { EnvService } from '@/config/env/env.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { HttpService } from '@nestjs/axios';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DataSource, FindOptionsWhere, In } from 'typeorm';
import { RolesGuard } from '@/modules/auth/guards/user-roles.guard';
import { MarketEnum } from '@/core/enums/sensatta/markets.enum';
import { CurrentUser } from '@/core/decorators/current-user.decorator';
import { User } from '@/core/user';
import { UserRole } from '@/core/enums/user-role.enum';
import { MARKETS } from '@/modules/sensatta/constants/get-markets';
import { FREIGHT_COMPANIES_QUERY } from '@/modules/freights/constants/freight-companies';

@Controller('sensatta')
export class SensattaController {
  constructor(
    private readonly dataSource: DataSource,
    private readonly envService: EnvService,
    private readonly httpService: HttpService,
  ) {}

  // ESSE CARA AQUI RETORNA TODAS AS EMPRESAS QUE UM USER TEM ACESSO
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('company')
  @HttpCode(HttpStatus.OK)
  getCompanies(@CurrentUser() user: User) {
    const where: FindOptionsWhere<Company> = { isConsideredOnStock: true };

    if (user.role !== UserRole.Admin) {
      const companies = user.userCompanies.map((i) => i.companyCode);
      where.sensattaCode = In(companies);
    }
    return this.dataSource.manager.find(Company, {
      where,
      order: {
        name: 'ASC',
      },
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('company/:id')
  @HttpCode(HttpStatus.OK)
  getCompany(@Param('id') id: string) {
    return this.dataSource.manager.find(Company, {
      where: { id },
      order: {
        name: 'ASC',
      },
    });
  }

  // TODO: MOVER PARA DENTRO DE FRETES
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('freight-companies')
  @HttpCode(HttpStatus.OK)
  getFreightCompanies() {
    const query = FREIGHT_COMPANIES_QUERY;
    return this.dataSource.query<
      {
        sensattaCode: string;
        sensattaName: string;
      }[]
    >(query, []);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/market')
  async getMarkets() {
    return MARKETS;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('product-line')
  @HttpCode(HttpStatus.OK)
  // todo: alocar isso em um service
  async getProductLine(@Query('market') market: MarketEnum = MarketEnum.MI) {
    const qb = this.dataSource
      .createQueryBuilder()
      .select([
        'spl.sensatta_id AS sensatta_id',
        'sib.product_line_code AS sensatta_code',
        'spl.name AS name',
        'spl.acronym AS acronym',
        'spl.is_considered_on_stock AS is_considered_on_stock',
        'spl.created_at AS created_at',
      ])
      .from('sensatta_incoming_batches', 'sib')
      .leftJoin(
        'sensatta_product_lines',
        'spl',
        'spl.sensatta_code = sib.product_line_code',
      )
      .where('1=1')
      .andWhere('spl.is_considered_on_stock = :isStock', { isStock: true })
      .distinct(true) // ✅ aqui você aplica o DISTINCT globalmente;
      .orderBy('sensatta_code', 'ASC');

    if (market !== MarketEnum.BOTH) {
      qb.andWhere('spl.market = :market', { market });
    }

    const data = await qb.getRawMany<{
      sensatta_id: string;
      sensatta_code: string;
      name: string;
      acronym: string;
      is_considered_on_stock: boolean;
      created_at: Date;
    }>();

    // sem de/para
    data.push({
      sensatta_id: 'N/D',
      sensatta_code: 'N/D',
      name: 'Sem DE/PARA',
      acronym: 'N/D',
      is_considered_on_stock: true,
      created_at: data[0].created_at,
    });

    return data
      .sort((a, b) => Number(a.sensatta_code) - Number(b.sensatta_code))
      .map((i) => ({
        sensattaId: i.sensatta_id,
        sensattaCode: i.sensatta_code,
        name: i.name,
        acronym: i.acronym,
        isConsideredOnStock: i.is_considered_on_stock,
        createdAt: i.created_at,
      }));
  }

  // TODO: MOVER PARA DENTRO DO ESTOQUE
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('product')
  @HttpCode(HttpStatus.OK)
  getProducts() {
    return this.dataSource.manager.find(Product, {
      order: {
        name: 'ASC',
      },
    });
  }

  // TODO: MOVER PARA DENTRO DO ESTOQUE
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('product/classification-types')
  @HttpCode(HttpStatus.OK)
  getProductTypes() {
    return PRODUCT_CLASSIFICATION_TYPES;
  }

  /*********************** SYNC CONTROLLERS ****************************/
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/stock/sync')
  @HttpCode(HttpStatus.CREATED)
  async syncStockWithServer() {
    const serverUrlCall = this.envService
      .get('SERVER_API_URL')
      .concat('/sensatta/sync/stock');
    try {
      await this.httpService.axiosRef.post(
        serverUrlCall,
        {},
        { timeout: 120 * 1000 },
      );
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/stock-balance/sync')
  @HttpCode(HttpStatus.CREATED)
  async syncStockBalanceWithServer() {
    const serverUrlCall = this.envService
      .get('SERVER_API_URL')
      .concat('/sensatta/sync/stock-balance');
    try {
      await this.httpService.axiosRef.post(
        serverUrlCall,
        {},
        { timeout: 120 * 1000 },
      );
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/freights/sync')
  @HttpCode(HttpStatus.CREATED)
  async syncFreightsWithServer() {
    const serverUrlCall = this.envService
      .get('SERVER_API_URL')
      .concat('/sensatta/sync/freights');
    try {
      await this.httpService.axiosRef.post(
        serverUrlCall,
        {},
        { timeout: 60 * 1000 },
      );
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/purchase/sync')
  @HttpCode(HttpStatus.CREATED)
  async syncPurchaseWithServer() {
    const serverUrlCall = this.envService
      .get('SERVER_API_URL')
      .concat('/sensatta/sync/purchase');
    try {
      await this.httpService.axiosRef.post(
        serverUrlCall,
        {},
        { timeout: 60 * 1000 },
      );
    } catch (error) {
      throw error;
    }
  }
}
