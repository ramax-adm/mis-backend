import { Module } from '@nestjs/common';
import { SalesReturnInvoicesService } from './services/sales-return-invoices.service';
import { SalesReturnInvoicesController } from './controllers/sales-return-invoices.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReturnInvoices } from './entities/return-invoice.entity';
import { Invoice } from './entities/invoice.entity';
import { SalesInvoicesService } from './services/sales-invoices.service';
import { SalesInvoicesController } from './controllers/sales-invoices.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ReturnInvoices, Invoice])],
  providers: [SalesInvoicesService, SalesReturnInvoicesService],
  controllers: [SalesInvoicesController, SalesReturnInvoicesController],
})
export class SalesModule {}
