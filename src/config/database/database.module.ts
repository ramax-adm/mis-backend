import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnvModule } from '../env/env.module';
import { EnvService } from '../env/env.service';
import { join } from 'path';
import { User } from '@/services/user/entities/user.entity';
import { Holiday } from '@/services/utils/entities/holiday.entity';
import { CashFlowSimulation } from '@/services/cash-flow/entities/cash-flow-simulation.entity';
import { Company } from '@/common/entities/sensatta/company.entity';
import { IncomingBatches } from '@/common/entities/sensatta/incoming-batch.entity';
import { ProductLine } from '@/common/entities/sensatta/product-line.entity';
import { Product } from '@/common/entities/sensatta/product.entity';
import { ReferencePrice } from '@/common/entities/sensatta/reference-price.entity';
import { Warehouse } from '@/common/entities/sensatta/warehouse.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [EnvModule],
      inject: [EnvService],
      useFactory: (envService: EnvService) => ({
        type: 'postgres', // Tipo do banco de dados
        host: envService.get('DB_HOST'),
        port: envService.get('DB_PORT'),
        username: envService.get('DB_USERNAME'),
        password: envService.get('DB_PASSWORD'),
        database: envService.get('DB_NAME'),
        schema: envService.get('DB_SCHEMA'),
        ssl: envService.get('DB_SSL'),
        synchronize: false,
        entities: [join(__dirname, '..', '..', '**', '*.entity.{ts,js}')],
        migrations: [join(__dirname, './migrations/**/*.{ts,js}')],
        logging: envService.get('DB_LOGGING'),
      }),
    }),
    TypeOrmModule.forFeature([
      CashFlowSimulation,
      Holiday,
      User,

      // sensatta
      Company,
      IncomingBatches,
      Product,
      ProductLine,
      ReferencePrice,
      Warehouse,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
