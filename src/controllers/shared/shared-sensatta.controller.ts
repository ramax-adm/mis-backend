import { Product } from '@/core/entities/sensatta/product.entity';
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

  @UseGuards(ApiKeyGuard)
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
