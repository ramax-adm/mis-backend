import { PRODUCT_CLASSIFICATION_TYPES } from '@/common/constants/sensatta/product-classification-types';
import { Company } from '@/common/entities/sensatta/company.entity';
import { ProductLine } from '@/common/entities/sensatta/product-line.entity';
import { Product } from '@/common/entities/sensatta/product.entity';
import { EnvService } from '@/config/env/env.service';
import { JwtAuthGuard } from '@/services/auth/guards/jwt-auth.guard';
import { HttpService } from '@nestjs/axios';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { INCOMING_BATCHES_PRODUCT_LINES_QUERY } from './constants/incoming-batches-product-lines';

@Controller('sensatta')
export class SensattaController {
  constructor(
    private readonly dataSource: DataSource,
    private readonly envService: EnvService,
    private readonly httpService: HttpService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('company')
  @HttpCode(HttpStatus.OK)
  getCompanies() {
    return this.dataSource.manager.find(Company, {
      where: { isConsideredOnStock: true },
      order: {
        name: 'ASC',
      },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('product-line')
  @HttpCode(HttpStatus.OK)
  getProductLine() {
    const query = INCOMING_BATCHES_PRODUCT_LINES_QUERY;

    return this.dataSource.query<ProductLine[]>(query, [true]);
  }

  @UseGuards(JwtAuthGuard)
  @Get('product')
  @HttpCode(HttpStatus.OK)
  getProducts() {
    return this.dataSource.manager.find(Product, {
      order: {
        name: 'ASC',
      },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('product/classification-types')
  @HttpCode(HttpStatus.OK)
  getProductTypes() {
    return PRODUCT_CLASSIFICATION_TYPES;
  }

  @UseGuards(JwtAuthGuard)
  @Post('/stock/sync')
  @HttpCode(HttpStatus.CREATED)
  async syncStockWithServer() {
    const serverUrlCall = this.envService
      .get('SERVER_API_URL')
      .concat('/sensatta/sync');
    try {
      await this.httpService.axiosRef.post(
        serverUrlCall,
        {},
        { timeout: 45 * 1000 },
      );
    } catch (error) {
      throw error;
    }
  }
}
