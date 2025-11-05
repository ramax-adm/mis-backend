import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountPayable } from './entities/account-payable.entity';
import { AccountReceivable } from './entities/account-receivable.entity';
import { AccountsReceivableService } from './services/accounts-receivable.service';
import { AccountsReceivableController } from './controllers/accounts-receivable.controller';
import { FinanceController } from './controllers/finance.controller';
import { AccountsReceivableReportService } from './services/accounts-receivable-report.service';
import { ExcelReaderService } from '@/core/services/excel-reader.service';

@Module({
  imports: [TypeOrmModule.forFeature([AccountPayable, AccountReceivable])],
  providers: [
    ExcelReaderService,
    AccountsReceivableService,
    AccountsReceivableReportService,
  ],
  controllers: [AccountsReceivableController, FinanceController],
})
export class FinanceModule {}
