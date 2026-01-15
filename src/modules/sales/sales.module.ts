import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReturnOccurrence } from './entities/return-occurrence.entity';
import { Invoice } from './entities/invoice.entity';
import { SalesInvoicesService } from './services/sales-invoices.service';
import { SalesInvoicesController } from './controllers/sales-invoices.controller';
import { HttpModule } from '@nestjs/axios';
import { EnvModule } from '@/config/env/env.module';
import { SalesInvoicesReportService } from './services/sales-invoices-report.service';
import { ExcelReaderService } from '@/core/services/excel-reader.service';
import { ReturnOccurrencesController } from './controllers/return-occurrences.controller';
import { ReturnOccurrencesService } from './services/return-occurrences.service';
import { OrdersController } from './controllers/orders.controller';
import { OrdersService } from './services/orders.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReturnOccurrence, Invoice]),
    EnvModule,
    HttpModule,
  ],
  providers: [
    ExcelReaderService,
    SalesInvoicesService,
    SalesInvoicesReportService,
    ReturnOccurrencesService,
    OrdersService,
  ],
  controllers: [
    SalesInvoicesController,
    ReturnOccurrencesController,
    OrdersController,
  ],
})
export class SalesModule {}
