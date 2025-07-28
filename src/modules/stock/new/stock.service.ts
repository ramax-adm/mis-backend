import { StockBalance } from '@/core/entities/sensatta/stock-balance.entity';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { GetStockNewLastUpdatedAtResponseDto } from './dto/get-stock-new-last-updated-at-response.dto';
import { STOCK_BALANCE_QUERY } from './constants/stock-balance-query';
import { MarketEnum } from '@/core/enums/sensatta/markets.enum';
import { STOCK_BALANCE_QUERY_PARTIAL_FILTERS } from './constants/stock-balance-query-partial-filters';

@Injectable()
export class StockNewService {
  constructor(private readonly dataSource: DataSource) {}

  async getStockLastUpdatedAt() {
    const [stock] = await this.dataSource.manager.find(StockBalance, {
      take: 1,
    });

    // Toda vez que eu atualizo os dados (dou carga novamente) o dado é recriado
    return {
      updatedAt: stock.createdAt,
    } as GetStockNewLastUpdatedAtResponseDto;
  }

  async getData({
    companyCode,
    market,
    productLineCode = null,
  }: {
    companyCode: string;
    market: MarketEnum;
    productLineCode?: string;
  }) {
    if (market === MarketEnum.BOTH) {
      market = '' as MarketEnum;
    }
    const data = await this.dataSource.query<
      {
        product_line_code: string;
        product_line_name: string;
        product_code: string;
        product_name: string;
        weight_in_kg: number;
        quantity: number;
        reserved_weight_in_kg: number;
        reserved_quantity: number;
        available_weight_in_kg: number;
        available_quantity: number;
      }[]
    >(STOCK_BALANCE_QUERY, [companyCode, market, productLineCode]);

    return data.map((item) => ({
      productLineCode: item.product_line_code,
      productLineName: item.product_line_name,
      productLine: `${item.product_line_code} - ${item.product_line_name}`,
      productCode: item.product_code,
      productName: item.product_name,
      product: `${item.product_code} - ${item.product_name}`,
      weightInKg: item.weight_in_kg,
      quantity: item.quantity,
      reservedWeightInKg: item.reserved_weight_in_kg,
      reservedQuantity: item.reserved_quantity,
      availableWeightInKg: item.available_weight_in_kg,
      availableQuantity: item.available_quantity,
    }));
  }

  async getDataWithPartialFilters({
    companyCode,
    productLineCode,
  }: {
    companyCode?: string;
    productLineCode?: string;
  }) {
    const data = await this.dataSource.query<
      {
        company_code: string;
        company_name: string;
        product_line_code: string;
        product_line_name: string;
        market: string;
        product_code: string;
        product_name: string;
        weight_in_kg: number;
        quantity: number;
        reserved_weight_in_kg: number;
        reserved_quantity: number;
        available_weight_in_kg: number;
        available_quantity: number;
        created_at: Date;
      }[]
    >(STOCK_BALANCE_QUERY_PARTIAL_FILTERS, [companyCode, productLineCode]);

    const marketMap = {
      [MarketEnum.ME]: 'ME',
      [MarketEnum.MI]: 'MI',
    };

    return data.map((item) => ({
      companyCode: item.company_code,
      companyName: item.company_name,
      productLineCode: item.product_line_code,
      productLineName: item.product_line_name,
      productLine: `${item.product_line_code} - ${item.product_line_name}`,
      market: marketMap[item.market] ?? 'N/D',
      productCode: item.product_code,
      productName: item.product_name,
      product: `${item.product_code} - ${item.product_name}`,
      weightInKg: item.weight_in_kg,
      quantity: item.quantity,
      reservedWeightInKg: item.reserved_weight_in_kg,
      reservedQuantity: item.reserved_quantity,
      availableWeightInKg: item.available_weight_in_kg,
      availableQuantity: item.available_quantity,
      createdAt: item.created_at,
    }));
  }

  async getAnalyticalData({
    companyCode,
    market,
    productLineCode,
  }: {
    companyCode: string;
    market: MarketEnum;
    productLineCode?: string;
  }) {
    const data = await this.getData({ companyCode, market, productLineCode });

    return data;
  }

  async getAggregatedAnalyticalData(
    entityKey: keyof StockBalance,
    {
      companyCode,
      market,
      productLineCode,
    }: {
      companyCode: string;
      market: MarketEnum;
      productLineCode?: string;
    },
  ) {
    const data = await this.getData({ companyCode, market, productLineCode });

    const map = new Map<
      string,
      {
        total: {
          weightInKg: number;
          quantity: number;
          reservedWeightInKg: number;
          reservedQuantity: number;
          availableWeightInKg: number;
          availableQuantity: number;
        };
        data: {
          productLineCode: string;
          productLineName: string;
          productCode: string;
          productName: string;
          weightInKg: number;
          quantity: number;
          reservedWeightInKg: number;
          reservedQuantity: number;
          availableWeightInKg: number;
          availableQuantity: number;
        }[];
      }
    >();

    for (const item of data) {
      const key = item[entityKey] as string;
      const group = {
        productLineCode: item.productLineCode,
        productLineName: item.productLineName,
        productCode: item.productCode,
        productName: item.productName,
        weightInKg: item.weightInKg,
        quantity: item.quantity,
        reservedWeightInKg: item.reservedWeightInKg,
        reservedQuantity: item.reservedQuantity,
        availableWeightInKg: item.availableWeightInKg,
        availableQuantity: item.availableQuantity,
      };

      if (!map.has(key)) {
        map.set(key, {
          data: [group],
          total: {
            weightInKg: group.weightInKg,
            quantity: group.quantity,
            reservedWeightInKg: group.reservedWeightInKg,
            reservedQuantity: group.reservedQuantity,
            availableWeightInKg: group.availableWeightInKg,
            availableQuantity: group.availableQuantity,
          },
        });
        continue;
      }
      const previousMap = map.get(key)!;
      previousMap.data.push(group);
      previousMap.total.weightInKg += group.weightInKg;
      previousMap.total.quantity += group.quantity;
      previousMap.total.reservedWeightInKg += group.reservedWeightInKg;
      previousMap.total.reservedQuantity += group.reservedQuantity;
      previousMap.total.availableWeightInKg += group.availableWeightInKg;
      previousMap.total.availableQuantity += group.availableQuantity;
    }

    const totals = {
      weightInKg: 0,
      quantity: 0,
      reservedWeightInKg: 0,
      reservedQuantity: 0,
      availableWeightInKg: 0,
      availableQuantity: 0,
    };

    for (const [, obj] of map) {
      totals.weightInKg += obj.total.weightInKg;
      totals.quantity += obj.total.quantity;
      totals.reservedWeightInKg += obj.total.reservedWeightInKg;
      totals.reservedQuantity += obj.total.reservedQuantity;
      totals.availableWeightInKg += obj.total.availableWeightInKg;
      totals.availableQuantity += obj.total.availableQuantity;
    }
    return {
      totals,
      items: Object.fromEntries(map),
    };
  }

  async getResumeData({}: {}) {}
}
