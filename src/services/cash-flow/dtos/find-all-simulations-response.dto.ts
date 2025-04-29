import { NumberUtils } from '@/services/utils/number.utils';
import { CashFlowSimulation } from '../entities/cash-flow-simulation.entity';
import { DateUtils } from '@/services/utils/date.utils';
import { User } from '@/services/user/entities/user.entity';

export class FindAllSimulationsResponseDto {
  id: string;
  publicId: number;
  name?: string;

  diasProjecao: number;
  cbsMe: number;
  cbsMi: number;
  pesoArroba: number;
  precoArrobaMe: number;
  precoArrobaMi: number;

  saidas: number;
  entradas: number;
  fechamento: number;
  createdAt: Date;
  createdBy: User;

  entity: CashFlowSimulation;

  constructor(data: CashFlowSimulation) {
    Object.assign(this, {
      id: data.id,
      publicId: data.publicId,
      name: data?.name,
      diasProjecao: data.requestDto.projecao.diasProjecao,
      cbsMe: data.requestDto.matPrima.cbsMe,
      cbsMi: data.requestDto.matPrima.cbsMi,
      pesoArroba: data.requestDto.matPrima.pesoArroba,
      precoArrobaMe: data.requestDto.matPrima.precoArrobaMe,
      precoArrobaMi: data.requestDto.matPrima.precoArrobaMi,
      saidas: data.results.operationClosureProjection.saidas,
      entradas: data.results.operationClosureProjection.entradas,
      fechamento: data.results.operationClosureProjection.fechamento,
      createdAt: data.createdAt,
      createdBy: data.createdBy,
      entity: data,
    });
  }

  static create(data: CashFlowSimulation) {
    return new FindAllSimulationsResponseDto(data);
  }

  toJSON() {
    return {
      id: this.id,
      publicId: this.publicId,
      name:
        this.name ??
        `Simulação do dia ${DateUtils.format(this.createdAt, 'datetime')}`,
      createdAt: DateUtils.format(this.createdAt, 'datetime'),
      createdBy: this.createdBy?.name,
      diasProjecao: this.diasProjecao,
      cbsMe: this.cbsMe,
      cbsMi: this.cbsMi,
      pesoArroba: this.pesoArroba,
      precoArrobaMe: this.precoArrobaMe,
      precoArrobaMi: this.precoArrobaMi,
      entradas: NumberUtils.toLocaleString(this.entradas),
      saidas: NumberUtils.toLocaleString(this.saidas),
      fechamento: NumberUtils.toLocaleString(this.fechamento),
      entity: this.entity,
    };
  }
}
