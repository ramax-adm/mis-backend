import { Module } from '@nestjs/common';
import { SalesReturnInvoicesService } from './services/sales-return-invoices.service';
import { SalesReturnInvoicesController } from './controllers/sales-return-invoices.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReturnInvoices } from './entities/return-invoice.entity';
import { Invoice } from './entities/invoice.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReturnInvoices, Invoice])],
  providers: [SalesReturnInvoicesService],
  controllers: [SalesReturnInvoicesController],
})
export class SalesModule {}
