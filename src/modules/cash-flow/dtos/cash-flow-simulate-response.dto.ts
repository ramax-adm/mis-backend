import { GetProductionValuesResponseDto } from './get-production-values-response.dto';
import { ProjectCostByKgResponseDto } from './project-cost-by-kg-response.dto';
import { ProjectDailyFlowResponseDto } from './project-daily-flow-response.dto';
import { ProjectEntriesResponseDto } from './project-entries-response.dto';
import { ProjectOperationClosureResponseDto } from './project-operation-closure-response.dto';
import { ProjectOutingsResponseDto } from './project-outings-response.dto';
import { ProjectProductionResponseDto } from './project-production-response.dto';

export class CashFlowSimulateResponseDto {
  productionValues: GetProductionValuesResponseDto;
  productionProjection: ProjectProductionResponseDto;
  entriesProjection: ProjectEntriesResponseDto;
  outingsProjection: ProjectOutingsResponseDto;
  operationClosureProjection: ProjectOperationClosureResponseDto;
  costsByKgProjection: ProjectCostByKgResponseDto;
  dailyFlowProjection: ProjectDailyFlowResponseDto;

  constructor(data: Omit<CashFlowSimulateResponseDto, 'toJSON'>) {
    Object.assign(this, data);
  }

  static create(data: Omit<CashFlowSimulateResponseDto, 'toJSON'>) {
    return new CashFlowSimulateResponseDto(data);
  }

  toJSON() {
    return {
      parsedData: {
        productionValues: GetProductionValuesResponseDto.getData(
          this.productionValues,
        ),
        productionProjection: ProjectProductionResponseDto.getData(
          this.productionProjection,
        ),
        entriesProjection: ProjectEntriesResponseDto.getData(
          this.entriesProjection,
        ),
        outingsProjection: ProjectOutingsResponseDto.getData(
          this.outingsProjection,
        ),
        operationClosureProjection: ProjectOperationClosureResponseDto.getData(
          this.operationClosureProjection,
        ),
        costsByKgProjection: ProjectCostByKgResponseDto.getData(
          this.costsByKgProjection,
        ),
        dailyFlowProjection: ProjectDailyFlowResponseDto.getData(
          this.dailyFlowProjection,
        ),
      },

      originalData: {
        productionValues: this.productionValues,
        productionProjection: this.productionProjection,
        entriesProjection: this.entriesProjection,
        outingsProjection: this.outingsProjection,
        operationClosureProjection: this.operationClosureProjection,
        costsByKgProjection: this.costsByKgProjection,
        dailyFlowProjection: this.dailyFlowProjection,
      },
    };
  }
}
