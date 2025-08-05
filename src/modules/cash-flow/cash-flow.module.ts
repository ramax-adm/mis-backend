import { EnvService } from '@/config/env/env.service';
import { ExcelReaderService } from '@/core/services/excel-reader.service';
import { Module } from '@nestjs/common';
import { CashFlowChampionCattleService } from './services/cash-flow-champion-cattle.service';
import { CashFlowReportService } from './services/cash-flow-report.service';
import { CashFlowSimulationService } from './services/cash-flow-simulation.service';
import { CashFlowService } from './services/cash-flow.service';
import { EnvModule } from '@/config/env/env.module';
import { CashFlowController } from './controllers/cash-flow.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashFlowProduct } from './entities/cash-flow-product.entity';
import { CashFlowSimulation } from './entities/cash-flow-simulation.entity';

@Module({
  imports: [
    EnvModule,
    TypeOrmModule.forFeature([CashFlowSimulation, CashFlowProduct]),
  ],
  providers: [
    // cash-flow
    CashFlowService,
    CashFlowChampionCattleService,
    CashFlowReportService,
    CashFlowSimulationService,

    EnvService,
    ExcelReaderService,
  ],
  controllers: [CashFlowController],
})
export class CashFlowModule {}
