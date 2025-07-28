import { NumberUtils } from '@/modules/utils/services/number.utils';
type CashFlowChampionCattleSimulateResponseData = {
  productName: string;
  productQuarter: string;
  productMarket: string;
  incomeMe: number;
  incomeMi: number;
  productPriceMe: number;
  productPriceMi: number;
  productPercentMe: number;
  productPercentMi: number;

  // TODO: Transformar em DTOs separados | PRODUCAO
  meProduction: number;
  miProduction: number;
  production: number;

  // TODO: Transformar em DTOs separados | RECEITAS
  miTotalInbound: number;
  miTotalInboundKg: number;
  meTotalInbound: number;
  meTotalInboundKg: number;
  totalInbound: number;

  // TODO: Transformar em DTOs separados | CUSTOS
  meBuyCosts: number;
  miBuyCosts: number;
  totalBuyCosts: number;
  meOperationCosts: number;
  miOperationCosts: number;
  totalOperationCosts: number;
  totalMiSalles: number;
  totalMeSalles: number;
  miTotalCosts: number;
  meTotalCosts: number;
  totalCosts: number;

  // TODO: Transformar em DTOs separados | FECHAMENTO
  finalResultMe: number;
  finalResultMeKg: number;
  finalResultMi: number;
  finalResultMiKg: number;
};
type CashFlowChampionCattleSimulateResponseTotals = {
  entries: {
    totalEntriesInKg: number;
    totalDtEntriesInKg: number;
    totalPaEntriesInKg: number;
    totalTrEntriesInKg: number;
  };
  production: {
    totalProductedInKg: number;
    totalDtProductedInKg: number;
    totalPaProductedInKg: number;
    totalTrProductedInKg: number;
  };
};

export type CashFlowChampionCattleSimulateResponseInput = {
  data: CashFlowChampionCattleSimulateResponseData[];
  totals: CashFlowChampionCattleSimulateResponseTotals;
};

export class CashFlowChampionCattleSimulateResponseDto {
  data: CashFlowChampionCattleSimulateResponseData[];
  totals: CashFlowChampionCattleSimulateResponseTotals;

  constructor(data: Omit<CashFlowChampionCattleSimulateResponseDto, 'toJSON'>) {
    Object.assign(this, data);
  }

  static create(data: CashFlowChampionCattleSimulateResponseInput) {
    return new CashFlowChampionCattleSimulateResponseDto(data);
  }

  toJSON(DIAS_PROJECAO: number) {
    const originalResponse = [];
    const projectedResponse = [];
    const totals = {
      entries: {
        totalEntriesInKg: NumberUtils.toLocaleString(
          this.totals.entries.totalEntriesInKg,
        ),
        totalDtEntriesInKg: NumberUtils.toLocaleString(
          this.totals.entries.totalDtEntriesInKg,
        ),
        totalPaEntriesInKg: NumberUtils.toLocaleString(
          this.totals.entries.totalPaEntriesInKg,
        ),
        totalTrEntriesInKg: NumberUtils.toLocaleString(
          this.totals.entries.totalTrEntriesInKg,
        ),
      },
      production: {
        totalProductedInKg: NumberUtils.toLocaleString(
          this.totals.production.totalProductedInKg,
        ),
        totalDtProductedInKg: NumberUtils.toLocaleString(
          this.totals.production.totalDtProductedInKg,
        ),
        totalPaProductedInKg: NumberUtils.toLocaleString(
          this.totals.production.totalPaProductedInKg,
        ),
        totalTrProductedInKg: NumberUtils.toLocaleString(
          this.totals.production.totalTrProductedInKg,
        ),
      },
    };
    for (const d of this.data) {
      projectedResponse.push({
        productName: d.productName,
        productQuarter: d.productQuarter.toUpperCase(),
        productMarket: d.productMarket,
        incomeMe: NumberUtils.toPercent(d.incomeMe),
        incomeMi: NumberUtils.toPercent(d.incomeMi),
        productPriceMe: NumberUtils.toMoney(d.productPriceMe),
        productPriceMi: NumberUtils.toMoney(d.productPriceMi),
        productPercentMe: NumberUtils.toPercent(d.productPercentMe),
        productPercentMi: NumberUtils.toPercent(d.productPercentMi),
        meProduction: NumberUtils.toLocaleString(
          d.meProduction * DIAS_PROJECAO,
        ),
        miProduction: NumberUtils.toLocaleString(
          d.miProduction * DIAS_PROJECAO,
        ),
        production: NumberUtils.toLocaleString(d.production * DIAS_PROJECAO),
        miTotalInbound: NumberUtils.toMoney(d.miTotalInbound * DIAS_PROJECAO),
        miTotalInboundKg: NumberUtils.toMoney(d.miTotalInboundKg),
        meTotalInbound: NumberUtils.toMoney(d.meTotalInbound * DIAS_PROJECAO),
        meTotalInboundKg: NumberUtils.toMoney(d.meTotalInboundKg),
        totalInbound: NumberUtils.toMoney(d.totalInbound * DIAS_PROJECAO),
        meBuyCosts: NumberUtils.toMoney(d.meBuyCosts * DIAS_PROJECAO),
        miBuyCosts: NumberUtils.toMoney(d.miBuyCosts * DIAS_PROJECAO),
        totalBuyCosts: NumberUtils.toMoney(d.totalBuyCosts * DIAS_PROJECAO),
        meOperationCosts: NumberUtils.toMoney(
          d.meOperationCosts * DIAS_PROJECAO,
        ),
        miOperationCosts: NumberUtils.toMoney(
          d.miOperationCosts * DIAS_PROJECAO,
        ),
        totalOperationCosts: NumberUtils.toMoney(
          d.totalOperationCosts * DIAS_PROJECAO,
        ),
        totalMiSalles: NumberUtils.toMoney(d.totalMiSalles * DIAS_PROJECAO),
        totalMeSalles: NumberUtils.toMoney(d.totalMeSalles * DIAS_PROJECAO),
        miTotalCosts: NumberUtils.toMoney(d.miTotalCosts * DIAS_PROJECAO),
        meTotalCosts: NumberUtils.toMoney(d.meTotalCosts * DIAS_PROJECAO),
        totalCosts: NumberUtils.toMoney(d.totalCosts * DIAS_PROJECAO),
        finalResultMe: NumberUtils.toMoney(d.finalResultMe * DIAS_PROJECAO),
        finalResultMeKg: NumberUtils.toMoney(d.finalResultMeKg),
        finalResultMi: NumberUtils.toMoney(d.finalResultMi * DIAS_PROJECAO),
        finalResultMiKg: NumberUtils.toMoney(d.finalResultMiKg),
      });

      originalResponse.push({
        productName: d.productName,
        productQuarter: d.productQuarter.toUpperCase(),
        productMarket: d.productMarket,
        incomeMe: NumberUtils.toPercent(d.incomeMe),
        incomeMi: NumberUtils.toPercent(d.incomeMi),
        productPriceMe: NumberUtils.toMoney(d.productPriceMe),
        productPriceMi: NumberUtils.toMoney(d.productPriceMi),
        productPercentMe: NumberUtils.toPercent(d.productPercentMe),
        productPercentMi: NumberUtils.toPercent(d.productPercentMi),
        meProduction: NumberUtils.toLocaleString(d.meProduction),
        miProduction: NumberUtils.toLocaleString(d.miProduction),
        production: NumberUtils.toLocaleString(d.production),
        miTotalInbound: NumberUtils.toMoney(d.miTotalInbound),
        miTotalInboundKg: NumberUtils.toMoney(d.miTotalInboundKg),
        meTotalInbound: NumberUtils.toMoney(d.meTotalInbound),
        meTotalInboundKg: NumberUtils.toMoney(d.meTotalInboundKg),
        totalInbound: NumberUtils.toMoney(d.totalInbound),
        meBuyCosts: NumberUtils.toMoney(d.meBuyCosts),
        miBuyCosts: NumberUtils.toMoney(d.miBuyCosts),
        totalBuyCosts: NumberUtils.toMoney(d.totalBuyCosts),
        meOperationCosts: NumberUtils.toMoney(d.meOperationCosts),
        miOperationCosts: NumberUtils.toMoney(d.miOperationCosts),
        totalOperationCosts: NumberUtils.toMoney(d.totalOperationCosts),
        totalMiSalles: NumberUtils.toMoney(d.totalMiSalles),
        totalMeSalles: NumberUtils.toMoney(d.totalMeSalles),
        miTotalCosts: NumberUtils.toMoney(d.miTotalCosts),
        meTotalCosts: NumberUtils.toMoney(d.meTotalCosts),
        totalCosts: NumberUtils.toMoney(d.totalCosts),
        finalResultMe: NumberUtils.toMoney(d.finalResultMe),
        finalResultMeKg: NumberUtils.toMoney(d.finalResultMeKg),
        finalResultMi: NumberUtils.toMoney(d.finalResultMi),
        finalResultMiKg: NumberUtils.toMoney(d.finalResultMiKg),
      });
    }

    return {
      originalResponse,
      projectedResponse,
      totals,
    };
  }
}
