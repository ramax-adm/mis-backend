import { Product } from '@/modules/stock/entities/product.entity';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ApiKeyGuard } from '@/modules/auth/guards/api-key-guard';

@Controller('shared/sensatta')
export class SharedSensattaController {
  constructor(private readonly dataSource: DataSource) {}

  @Get('product')
  @HttpCode(HttpStatus.OK)
  getProducts() {
    return this.dataSource.manager.find(Product, {
      order: {
        name: 'ASC',
      },
    });
  }
}
