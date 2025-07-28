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
import { FREIGHT_COMPANIES_QUERY } from '@/controllers/_constants/freight-companies';
import { INCOMING_BATCHES_PRODUCT_LINES_QUERY } from '@/controllers/_constants/incoming-batches-product-lines';

@Controller('sensatta')
export class SensattaController {
  constructor(
    private readonly dataSource: DataSource,
    private readonly envService: EnvService,
    private readonly httpService: HttpService,
  ) {}

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
  getProductLine(@Query('market') market: MarketEnum = MarketEnum.MI) {
    const query = INCOMING_BATCHES_PRODUCT_LINES_QUERY;

    return this.dataSource.query<ProductLine[]>(query, [market, true]);
  }

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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('product/classification-types')
  @HttpCode(HttpStatus.OK)
  getProductTypes() {
    return PRODUCT_CLASSIFICATION_TYPES;
  }

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
