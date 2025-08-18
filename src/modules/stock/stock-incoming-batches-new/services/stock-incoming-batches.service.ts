import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  GetIncomingBatchesItem,
  GetIncomingBatchesItemRaw,
} from '../types/get-incoming-batches.type';
import { MarketEnum } from '@/core/enums/sensatta/markets.enum';
import * as dateFns from 'date-fns';

@Injectable()
export class StockIncomingBatchesService {
  constructor(private readonly datasource: DataSource) {}

  async getIncomingBatchData({
    market,
    productLineCodes,
  }: {
    market?: MarketEnum;
    productLineCodes?: string[];
  }): Promise<GetIncomingBatchesItem[]> {
    const qb = this.datasource.createQueryBuilder();

    qb.from('sensatta_incoming_batches', 'sib') // tabela principal
      .leftJoin(
        'sensatta_products',
        'sp',
        'sib.product_code = sp.sensatta_code',
      )
      .leftJoin(
        'sensatta_product_lines',
        'spl',
        'sib.product_line_code = spl.sensatta_code',
      )
      .leftJoin(
        'sensatta_warehouses',
        'sw',
        'sib.warehouse_code = sw.sensatta_code',
      )
      .leftJoin(
        'sensatta_companies',
        'sc',
        'sib.company_code = sc.sensatta_code',
      )
      .where('sc.is_considered_on_stock = :trueVal', { trueVal: true })
      .andWhere('sw.is_considered_on_stock = :trueVal', { trueVal: true })
      .select([
        'sc.sensatta_code AS company_code',
        'sc.name AS company_name',
        'sp.sensatta_code AS product_code',
        'sp.name AS product_name',
        'spl.sensatta_code AS product_line_code',
        'spl.name AS product_line_name',
        'spl.market AS market',
        'sib.production_date AS production_date',
        'sib.slaughter_date AS slaughter_date',
        'sib.due_date AS due_date',
        'SUM(sib.box_amount) AS box_amount',
        'SUM(sib.quantity) AS quantity',
        'SUM(sib.weight_in_kg) AS weight_in_kg',
      ])
      .groupBy('sc.sensatta_code')
      .addGroupBy('sc.name')
      .addGroupBy('sp.sensatta_code')
      .addGroupBy('sp.name')
      .addGroupBy('spl.sensatta_code')
      .addGroupBy('spl.name')
      .addGroupBy('spl.market')
      .addGroupBy('sib.production_date')
      .addGroupBy('sib.slaughter_date')
      .addGroupBy('sib.due_date');

    if (market) {
      qb.andWhere('spl.market =:market', { market });
    }

    if (productLineCodes) {
      qb.andWhere('spl.market IN (:...productLineCodes)', { productLineCodes });
    }

    const results = await qb.getRawMany<GetIncomingBatchesItemRaw>();

    return results.map((i) => ({
      companyCode: i.company_code,
      companyName: i.company_name,
      productCode: i.product_code,
      productName: i.product_name,
      productLineCode: i.product_line_code,
      productLineName: i.product_line_name,
      market: i.market,
      productionDate: i.production_date,
      slaughterDate: i.slaughter_date,
      dueDate: i.due_date,
      boxAmount: i.box_amount,
      quantity: i.quantity,
      weightInKg: i.weight_in_kg,
    }));
  }

  /**
   * Estoque novo
   *
   * totals: {
   *    weight_in_kg,
   *    by_expire_range:{},
   *    by_company:{}
   * },
   *
   * data: {
   *   "PRODUTO": {
   *      market,
   *      product_line_code,
   *      product_line_name,
   *      product_code,
   *      product_name,
   *      totals:{
   *          weight_in_kg,
   *          by_expire_range:{},
   *          by_company:{}
   *      },
   *   }
   * }
   */
  async getResumedData({
    market,
    productLineCodes,
  }: {
    market?: MarketEnum;
    productLineCodes?: string[];
  }) {
    const incomingBatches = await this.getIncomingBatchData({
      market,
      productLineCodes,
    });

    const map = new Map<
      string,
      {
        market: string;
        productLineCode: string;
        productLineName: string;
        productCode: string;
        productName: string;
        totals: {
          weightInKg: number;
          expiredWeightInKg: number;
          byExpireRange: Map<string, number>;
          byCompany: Map<string, number>;
        };
      }
    >();

    // DATA Values
    for (const batch of incomingBatches) {
      const key = `${batch.productCode} - ${batch.productName}`;

      const currentDaysToExpires = dateFns.differenceInDays(
        batch.dueDate,
        new Date(),
      );

      if (!map.has(key)) {
        map.set(key, {
          market: batch.market,
          productLineCode: batch.productLineCode,
          productLineName: batch.productLineName,
          productCode: batch.productCode,
          productName: batch.productName,
          totals: {
            weightInKg: 0,
            expiredWeightInKg: 0,
            byExpireRange: new Map(),
            byCompany: new Map(),
          },
        });
      }

      const previousMap = map.get(key)!;

      // soma peso total
      previousMap.totals.weightInKg += batch.weightInKg;

      // soma peso expirado
      if (currentDaysToExpires < 0) {
        previousMap.totals.expiredWeightInKg += batch.weightInKg;
      }

      // por empresa
      const companyKey = `${batch.companyCode} - ${batch.companyName}`;
      previousMap.totals.byCompany.set(
        companyKey,
        (previousMap.totals.byCompany.get(companyKey) ?? 0) + batch.weightInKg,
      );

      // por faixa de expiração
      const toExpiresUntil15DaysKey = '0 A 15 dias';
      const toExpiresBetween15And30DaysKey = '15 A 30 dias';

      if (currentDaysToExpires <= 15) {
        previousMap.totals.byExpireRange.set(
          toExpiresUntil15DaysKey,
          (previousMap.totals.byExpireRange.get(toExpiresUntil15DaysKey) ?? 0) +
            batch.weightInKg,
        );
      } else if (currentDaysToExpires <= 30) {
        previousMap.totals.byExpireRange.set(
          toExpiresBetween15And30DaysKey,
          (previousMap.totals.byExpireRange.get(
            toExpiresBetween15And30DaysKey,
          ) ?? 0) + batch.weightInKg,
        );
      }
    }

    // conversão dos Maps internos para objetos simples
    const mapEntries = Array.from(map.entries());
    const data = Object.fromEntries(
      mapEntries.map(([key, value]) => [
        key,
        {
          ...value,
          totals: {
            ...value.totals,
            byExpireRange: Object.fromEntries(value.totals.byExpireRange),
            byCompany: Object.fromEntries(value.totals.byCompany),
          },
        },
      ]),
    );

    // TOTAL Values
    const totals = this.getResumeTotals(incomingBatches);

    return {
      totals,
      data,
    };
  }

  private getResumeTotals(batches: GetIncomingBatchesItem[]) {
    const totals = {
      weightInKg: 0,
      expiredWeightInKg: 0,
      byExpireRange: new Map<string, number>(),
      byCompany: new Map<string, number>(),
    };

    const toExpiresUntil15DaysKey = '0 A 15 dias';
    const toExpiresBetween15And30DaysKey = '15 A 30 dias';

    for (const batch of batches) {
      const currentDaysToExpires = dateFns.differenceInDays(
        batch.dueDate,
        new Date(),
      );

      // soma peso total
      totals.weightInKg += batch.weightInKg;

      // soma peso expirado
      if (currentDaysToExpires < 0) {
        totals.expiredWeightInKg += batch.weightInKg;
      }

      // soma por empresa
      const companyKey = `${batch.companyCode} - ${batch.companyName}`;
      totals.byCompany.set(
        companyKey,
        (totals.byCompany.get(companyKey) ?? 0) + batch.weightInKg,
      );

      // soma por faixa de expiração
      if (currentDaysToExpires <= 15) {
        totals.byExpireRange.set(
          toExpiresUntil15DaysKey,
          (totals.byExpireRange.get(toExpiresUntil15DaysKey) ?? 0) +
            batch.weightInKg,
        );
      } else if (currentDaysToExpires <= 30) {
        totals.byExpireRange.set(
          toExpiresBetween15And30DaysKey,
          (totals.byExpireRange.get(toExpiresBetween15And30DaysKey) ?? 0) +
            batch.weightInKg,
        );
      }
    }

    return {
      weightInKg: totals.weightInKg,
      expiredWeightInKg: totals.expiredWeightInKg,
      byExpireRange: Object.fromEntries(totals.byExpireRange),
      byCompany: Object.fromEntries(totals.byCompany),
    };
  }
}
