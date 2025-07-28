import { NumberUtils } from '@/modules/utils/services/number.utils';

export class ProjectCostByKgResponseDto {
  total: CostsTotals;
  costs: CostsProjected;
  kpis: KpisProjected;

  static getData(raw: ProjectCostByKgResponseDto) {
    return {
      total: {
        totalCustoTotal: NumberUtils.toMoney(raw.total.totalCustoTotal),
        totalCustoKgTotal: NumberUtils.toMoney(raw.total.totalCustoKgTotal),
        totalCustoAnimaisTotal: NumberUtils.toMoney(
          raw.total.totalCustoAnimaisTotal,
        ),
        totalCustoKgAnimaisTotal: NumberUtils.toMoney(
          raw.total.totalCustoKgAnimaisTotal,
        ),
        totalCustoArrendTotal: NumberUtils.toMoney(
          raw.total.totalCustoArrendTotal,
        ),
        totalCustoKgArrendTotal: NumberUtils.toMoney(
          raw.total.totalCustoKgArrendTotal,
        ),

        totalCustoMe: NumberUtils.toMoney(raw.total.totalCustoMe),
        totalCustoKgMe: NumberUtils.toMoney(raw.total.totalCustoKgMe),
        totalCustoAnimaisMe: NumberUtils.toMoney(raw.total.totalCustoAnimaisMe),
        totalCustoKgAnimaisMe: NumberUtils.toMoney(
          raw.total.totalCustoKgAnimaisMe,
        ),
        totalCustoArrendMe: NumberUtils.toMoney(raw.total.totalCustoArrendMe),
        totalCustoKgArrendMe: NumberUtils.toMoney(
          raw.total.totalCustoKgArrendMe,
        ),

        totalCustoMi: NumberUtils.toMoney(raw.total.totalCustoMi),
        totalCustoKgMi: NumberUtils.toMoney(raw.total.totalCustoKgMi),
        totalCustoAnimaisMi: NumberUtils.toMoney(raw.total.totalCustoAnimaisMi),
        totalCustoKgAnimaisMi: NumberUtils.toMoney(
          raw.total.totalCustoKgAnimaisMi,
        ),
        totalCustoArrendMi: NumberUtils.toMoney(raw.total.totalCustoArrendMi),
        totalCustoKgArrendMi: NumberUtils.toMoney(
          raw.total.totalCustoKgArrendMi,
        ),
      },
      costs: {
        custoTotal: raw.costs.custoTotal
          .sort((a, b) => b.value - a.value) // Ordenação decrescente por 'value'
          .map((cost) => ({
            label: cost.label,
            value: NumberUtils.toMoney(cost.value),
            costByKg: NumberUtils.toMoney(cost.costByKg),
          })),
        custoMe: raw.costs.custoMe
          .sort((a, b) => b.value - a.value) // Ordenação decrescente por 'value'
          .map((cost) => ({
            label: cost.label,
            value: NumberUtils.toMoney(cost.value),
            costByKg: NumberUtils.toMoney(cost.costByKg),
          })),
        custoMi: raw.costs.custoMi
          .sort((a, b) => b.value - a.value) // Ordenação decrescente por 'value'
          .map((cost) => ({
            label: cost.label,
            value: NumberUtils.toMoney(cost.value),
            costByKg: NumberUtils.toMoney(cost.costByKg),
          })),
        custoTotalAnimais: raw.costs.custoTotalAnimais
          .sort((a, b) => b.value - a.value) // Ordenação decrescente por 'value'
          .map((cost) => ({
            label: cost.label,
            value: NumberUtils.toMoney(cost.value),
            costByKg: NumberUtils.toMoney(cost.costByKg),
          })),
        custoMeAnimais: raw.costs.custoMeAnimais
          .sort((a, b) => b.value - a.value) // Ordenação decrescente por 'value'
          .map((cost) => ({
            label: cost.label,
            value: NumberUtils.toMoney(cost.value),
            costByKg: NumberUtils.toMoney(cost.costByKg),
          })),
        custoMiAnimais: raw.costs.custoMiAnimais
          .sort((a, b) => b.value - a.value) // Ordenação decrescente por 'value'
          .map((cost) => ({
            label: cost.label,
            value: NumberUtils.toMoney(cost.value),
            costByKg: NumberUtils.toMoney(cost.costByKg),
          })),
        custoTotalArred: raw.costs.custoTotalArred
          .sort((a, b) => b.value - a.value) // Ordenação decrescente por 'value'
          .map((cost) => ({
            label: cost.label,
            value: NumberUtils.toMoney(cost.value),
            costByKg: NumberUtils.toMoney(cost.costByKg),
          })),
        custoMeArred: raw.costs.custoMeArred
          .sort((a, b) => b.value - a.value) // Ordenação decrescente por 'value'
          .map((cost) => ({
            label: cost.label,
            value: NumberUtils.toMoney(cost.value),
            costByKg: NumberUtils.toMoney(cost.costByKg),
          })),
        custoMiArred: raw.costs.custoMiArred
          .sort((a, b) => b.value - a.value) // Ordenação decrescente por 'value'
          .map((cost) => ({
            label: cost.label,
            value: NumberUtils.toMoney(cost.value),
            costByKg: NumberUtils.toMoney(cost.costByKg),
          })),
      },
      kpis: {
        me: {
          custoKgFinalMe: NumberUtils.toMoney(raw.kpis.me.custoKgFinalMe),
          vendaKgMe: NumberUtils.toMoney(raw.kpis.me.vendaKgMe),
          margemBrutaMe: NumberUtils.toPercent(raw.kpis.me.margemBrutaMe),
          margemLiquidaMe: NumberUtils.toPercent(raw.kpis.me.margemLiquidaMe),
        },
        mi: {
          custoKgFinalMi: NumberUtils.toMoney(raw.kpis.mi.custoKgFinalMi),
          vendaKgMi: NumberUtils.toMoney(raw.kpis.mi.vendaKgMi),
          margemBrutaMi: NumberUtils.toPercent(raw.kpis.mi.margemBrutaMi),
          margemLiquidaMi: NumberUtils.toPercent(raw.kpis.mi.margemLiquidaMi),
        },
        total: {
          custoKgFinal: NumberUtils.toMoney(raw.kpis.total.custoKgFinal),
          vendaKg: NumberUtils.toMoney(raw.kpis.total.vendaKg),
          margemBruta: NumberUtils.toPercent(raw.kpis.total.margemBruta),
          margemLiquida: NumberUtils.toPercent(raw.kpis.total.margemLiquida),
        },
      },
    };
  }
}

export class CostsProjected {
  custoTotal: CostsTransposed[];
  custoMe: CostsTransposed[];
  custoMi: CostsTransposed[];

  custoTotalAnimais: CostsTransposed[];
  custoMeAnimais: CostsTransposed[];
  custoMiAnimais: CostsTransposed[];

  custoTotalArred: CostsTransposed[];
  custoMeArred: CostsTransposed[];
  custoMiArred: CostsTransposed[];
}

export class CostsTotals {
  totalCustoTotal: number;
  totalCustoKgTotal: number;
  totalCustoAnimaisTotal: number;
  totalCustoKgAnimaisTotal: number;
  totalCustoArrendTotal: number;
  totalCustoKgArrendTotal: number;

  totalCustoMe: number;
  totalCustoKgMe: number;
  totalCustoAnimaisMe: number;
  totalCustoKgAnimaisMe: number;
  totalCustoArrendMe: number;
  totalCustoKgArrendMe: number;

  totalCustoMi: number;
  totalCustoKgMi: number;
  totalCustoAnimaisMi: number;
  totalCustoKgAnimaisMi: number;
  totalCustoArrendMi: number;
  totalCustoKgArrendMi: number;
}

export class CostsTransposed {
  label: string;
  value: number;
  costByKg: number;
}

export class KpisProjected {
  me: {
    custoKgFinalMe: number;
    vendaKgMe: number;
    margemBrutaMe: number;
    margemLiquidaMe: number;
  };
  mi: {
    custoKgFinalMi: number;
    vendaKgMi: number;
    margemBrutaMi: number;
    margemLiquidaMi: number;
  };
  total: {
    custoKgFinal: number;
    vendaKg: number;
    margemBruta: number;
    margemLiquida: number;
  };
}
