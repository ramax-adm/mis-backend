import { DatabaseModule } from '@/config/database/database.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParameterSalesDeductionProductLine } from './entities/parameter-sales-deduction-product-line.entity';
import { ParameterSalesDeduction } from './entities/parameter-sales-deduction.entity';
import { ParameterSalesDeductionsService } from './services/parameter-sales-deductions.service';
import { ParameterSalesDeductionsController } from './controllers/parameter-sales-deductions.controller';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([
      ParameterSalesDeduction,
      ParameterSalesDeductionProductLine,
    ]),
  ],
  providers: [ParameterSalesDeductionsService],
  controllers: [ParameterSalesDeductionsController],
  exports: [],
})
export class ParametersModule {}
