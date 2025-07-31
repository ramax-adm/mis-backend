import { StockBalance } from '@/modules/stock/stock-balance/entities/stock-balance.entity';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { GetStockNewLastUpdatedAtResponseDto } from '../dtos/get-stock-new-last-updated-at-response.dto';
import { MarketEnum } from '@/core/enums/sensatta/markets.enum';
import { STOCK_BALANCE_QUERY_PARTIAL_FILTERS } from '../constants/stock-balance-query-partial-filters';
import { GetStockBalanceItem } from '../types/get-stock-balance.type';

@Injectable()
export class StockBalanceService {
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
    const qb = this.dataSource
      .createQueryBuilder()
      .select([
        'sb.product_line_code AS product_line_code',
        'sb.product_line_name AS product_line_name',
        'sb.product_code AS product_code',
        'sb.product_name AS product_name',
        'sb.weight_in_kg AS weight_in_kg',
        'sb.quantity AS quantity',
        'sb.reserved_weight_in_kg AS reserved_weight_in_kg',
        'sb.reserved_quantity AS reserved_quantity',
        'sb.available_weight_in_kg AS available_weight_in_kg',
        'sb.available_quantity AS available_quantity',
      ])
      .from('sensatta_stock_balance', 'sb')
      .leftJoin(
        'sensatta_product_lines',
        'spl',
        'sb.product_line_code = spl.sensatta_code',
      )
      .where('sb.company_code = :companyCode', { companyCode })
      .andWhere('spl.is_considered_on_stock = true');
    //.andWhere('sb.quantity <> 0')

    if (market !== MarketEnum.BOTH) {
      qb.andWhere('spl.market::TEXT LIKE :market', { market: `%${market}%` });
    }

    if (productLineCode || productLineCode === '') {
      const splittedProductLines = productLineCode.split(',');
      qb.andWhere('sb.product_line_code IN (:...productLineCodes)', {
        productLineCodes: splittedProductLines,
      });
    }

    const results = await qb.getRawMany<GetStockBalanceItem>();

    return results
      .sort((a, b) => Number(a.product_line_code) - Number(b.product_line_code))
      .map((item) => ({
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

    const totals = data.reduce(
      (acc, item) => ({
        weightInKg: acc.weightInKg + item.weightInKg,
        quantity: acc.quantity + item.quantity,
        reservedWeightInKg: acc.reservedWeightInKg + item.reservedWeightInKg,
        reservedQuantity: acc.reservedQuantity + item.reservedQuantity,
        availableWeightInKg: acc.availableWeightInKg + item.availableWeightInKg,
        availableQuantity: acc.availableQuantity + item.availableQuantity,
      }),
      {
        weightInKg: 0,
        quantity: 0,
        reservedWeightInKg: 0,
        reservedQuantity: 0,
        availableWeightInKg: 0,
        availableQuantity: 0,
      },
    );

    return {
      totals,
      items: data,
    };
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
