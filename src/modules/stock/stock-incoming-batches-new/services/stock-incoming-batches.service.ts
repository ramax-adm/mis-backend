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
        'sw.company_code = sc.sensatta_code',
      )
      .where('1=1')
      .andWhere('sc.is_considered_on_stock = :trueVal', { trueVal: true })
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
      .addGroupBy('sib.due_date')
      .orderBy('spl.sensatta_code::int', 'ASC')
      .addOrderBy('sp.sensatta_code::int', 'ASC');

    if (market) {
      qb.andWhere('spl.market =:market', { market });
    }

    if (productLineCodes) {
      qb.andWhere('sib.product_line_code IN (:...productLineCodes)', {
        productLineCodes,
      });
    }

    const results = await qb.getRawMany<GetIncomingBatchesItemRaw>();

    return results.map((i) => ({
      companyCode: i.company_code,
      companyName: i.company_name.split('-')[0],
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

    // DATA Values
    const data = this.getResumeData(incomingBatches);

    // TOTAL Values
    const totals = this.getResumeTotals(incomingBatches);

    return {
      totals,
      data,
    };
  }

  private getResumeData(batches: GetIncomingBatchesItem[]) {
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

    const companyKeys = this.getCompanyKeys(batches);
    const expireRangeKeys = this.getExpireKeys(batches);

    // DATA Values
    for (const batch of batches) {
      const key = `${batch.productCode} - ${batch.productName}`;
      const currentDaysToExpires = dateFns.differenceInDays(
        batch.dueDate,
        new Date(),
      );

      if (!map.has(key)) {
        // Inicializa os Maps internos com chaves na ordem
        const byExpireRange = new Map<string, number>(
          expireRangeKeys.map((k) => [k.key, 0]),
        );
        const byCompany = new Map<string, number>(
          companyKeys.map((k) => [k, 0]),
        );

        map.set(key, {
          market: batch.market,
          productLineCode: batch.productLineCode,
          productLineName: batch.productLineName,
          productCode: batch.productCode,
          productName: batch.productName,
          totals: {
            weightInKg: 0,
            expiredWeightInKg: 0,
            byExpireRange,
            byCompany,
          },
        });
      }

      const previousMap = map.get(key)!;

      // Soma peso total
      previousMap.totals.weightInKg += batch.weightInKg;

      // Por empresa
      const companyKey = `${batch.companyCode} - ${batch.companyName}`;
      previousMap.totals.byCompany.set(
        companyKey,
        (previousMap.totals.byCompany.get(companyKey) ?? 0) + batch.weightInKg,
      );

      // Por faixa de expiração
      // Soma peso expirado

      if (currentDaysToExpires < 0) {
        previousMap.totals.expiredWeightInKg += batch.weightInKg;
      } else {
        // encontra a faixa que corresponde ao número de dias
        const matchedRange = expireRangeKeys.find((range) => {
          const minOk = currentDaysToExpires >= range.minQuantityOfDays;
          const maxOk =
            range.maxQuantityOfDays === undefined ||
            currentDaysToExpires <= range.maxQuantityOfDays;

          return minOk && maxOk;
        });

        if (matchedRange) {
          previousMap.totals.byExpireRange.set(
            matchedRange.key,
            (previousMap.totals.byExpireRange.get(matchedRange.key) ?? 0) +
              batch.weightInKg,
          );
        }
      }
    }

    // Conversão dos Maps internos para objetos simples
    const mapEntries = Array.from(map.entries());
    return Object.fromEntries(
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
  }

  private getResumeTotals(batches: GetIncomingBatchesItem[]) {
    const companyKeys = this.getCompanyKeys(batches);
    const expireRangeKeys = this.getExpireKeys(batches);

    const totals = {
      weightInKg: 0,
      expiredWeightInKg: 0,
      byExpireRange: new Map<string, number>(
        expireRangeKeys.map((k) => [k.key, 0]),
      ),
      byCompany: new Map<string, number>(companyKeys.map((k) => [k, 0])),
    };

    for (const batch of batches) {
      const currentDaysToExpires = dateFns.differenceInDays(
        batch.dueDate,
        new Date(),
      );

      // soma peso total
      totals.weightInKg += batch.weightInKg;

      // soma por empresa
      const companyKey = `${batch.companyCode} - ${batch.companyName}`;
      totals.byCompany.set(
        companyKey,
        (totals.byCompany.get(companyKey) ?? 0) + batch.weightInKg,
      );

      // soma por faixa de expiração
      // soma peso expirado
      if (currentDaysToExpires < 0) {
        totals.expiredWeightInKg += batch.weightInKg;
      } else {
        // encontra a faixa que corresponde ao número de dias
        const matchedRange = expireRangeKeys.find((range) => {
          const minOk = currentDaysToExpires >= range.minQuantityOfDays;
          const maxOk =
            range.maxQuantityOfDays === undefined ||
            currentDaysToExpires <= range.maxQuantityOfDays;

          return minOk && maxOk;
        });

        if (matchedRange) {
          totals.byExpireRange.set(
            matchedRange.key,
            (totals.byExpireRange.get(matchedRange.key) ?? 0) +
              batch.weightInKg,
          );
        }
      }
    }

    return {
      weightInKg: totals.weightInKg,
      expiredWeightInKg: totals.expiredWeightInKg,
      byExpireRange: Object.fromEntries(
        expireRangeKeys.map(({ key }) => [
          key,
          totals.byExpireRange.get(key) ?? 0,
        ]),
      ),
      byCompany: Object.fromEntries(totals.byCompany),
    };
  }

  // aux methods
  private getCompanyKeys(batches: GetIncomingBatchesItem[]) {
    const companyKeysSet = new Set<string>();
    batches.forEach((i) =>
      companyKeysSet.add(`${i.companyCode} - ${i.companyName}`),
    );

    return Array.from(companyKeysSet).sort((a, b) => {
      const companyCodeA = a.split(' - ')[0];
      const companyCodeB = b.split(' - ')[0];

      return Number(companyCodeA) - Number(companyCodeB);
    });
  }

  private getExpireKeys(batches: GetIncomingBatchesItem[]) {
    const expireRanges = [
      {
        key: '0 A 15 dias',
        minQuantityOfDays: 0,
        maxQuantityOfDays: 15,
      },
      {
        key: '16 A 30 dias',
        minQuantityOfDays: 16,
        maxQuantityOfDays: 30,
      },
      {
        key: '+30 dias',
        minQuantityOfDays: 31,
      },
    ];
    return expireRanges;
  }
}
