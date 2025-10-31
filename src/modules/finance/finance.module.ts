import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountPayable } from './entities/account-payable.entity';
import { AccountReceivable } from './entities/account-receivable.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AccountPayable, AccountReceivable])],
})
export class FinanceModule {}
