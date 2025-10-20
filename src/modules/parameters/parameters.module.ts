import { DatabaseModule } from '@/config/database/database.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParameterSalesDeductionsService } from './services/parameter-sales-deductions.service';
import { ParameterSalesDeductionsController } from './controllers/parameter-sales-deductions.controller';

@Module({
  imports: [DatabaseModule, TypeOrmModule.forFeature([])],
  providers: [ParameterSalesDeductionsService],
  controllers: [ParameterSalesDeductionsController],
  exports: [],
})
export class ParametersModule {}
