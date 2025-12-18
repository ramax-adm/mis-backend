import { Invoice } from '@/modules/sales/entities/invoice.entity';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CONSIDERED_NF_SITUATIONS } from '../constants/considered-nf-situations';
import { CONSIDERED_CFOPS } from '../constants/considered-cfops';
import { ByMonthAgg } from '../types/get-overview-audit-data.type';
import { ReturnOccurrence } from '@/modules/sales/entities/return-occurrence.entity';
import { CattleSlaughter } from '@/modules/purchases/entities/cattle-slaughter.entity';
import { ProductionMovement } from '@/modules/stock/entities/production-movement.entity';

/**
 * Aqui a estrategia vai ser um pouco diferente
 *
 * Os dados agregados, vamos buscar dessa forma ja do banco de dados
 * para ver como que fica a performance
 *
 * Estrategia, como esse report nao tem filtros tentar buscar os dados agregados ja do banco de dados
 * para retornar ao frontend
 *
 * Tbm Testar caching aqui
 * - sales
 * - return occurrences
 * - slaughters ...
 */
@Injectable()
export class BusinessAuditOverviewService {
  constructor(private readonly datasource: DataSource) {}

  async getData() {
    const [
      billingsByMonth,
      billingsTotals,
      returnByType,
      returnByMonth,
      returnTotals,
      slaughtersByMonth,
      slaughtersTotals,
      stockByMonth,
      stockTotals,
      stockByQuarter,
      stockByProduct,
    ] = await Promise.all([
      this.getBillingsByMonth(),
      this.getBillingsTotals(),
      this.getReturnOccurrencesByReturnType(),
      this.getReturnOccurrencesByMonth(),
      this.getReturnOccurrencesTotals(),
      this.getSlaughtersByMonth(),
      this.getSlaughtersTotals(),
      this.getStockProductionByMonth(),
      this.getStockProductionTotals(),
      this.getStockProductionByQuarter(),
      this.getStockProductionByProduct(),
    ]);

    return {
      billingsByMonth,
      billingsTotals,
      returnByMonth,
      returnTotals,
      slaughtersByMonth,
      slaughtersTotals,
      stockByMonth,
      stockTotals,
      stockByQuarter,
      stockByProduct,
    };
  }

  // billings by month
  // billings totals
  private async getBillingsByMonth(): Promise<ByMonthAgg> {
    const qb = this.datasource
      .getRepository(Invoice)
      .createQueryBuilder('si')
      .select([
        `EXTRACT(YEAR FROM si.date) AS year`,
        `EXTRACT(MONTH FROM si.date) AS month`,
        `COUNT(*) AS quantity`,
        `SUM(CAST(si.weight_in_kg AS numeric)) AS weight_in_kg`,
        `SUM(CAST(si.total_price AS numeric)) AS value`,
      ])
      .where('si.nf_situation IN (:...nfSituation)', {
        nfSituation: CONSIDERED_NF_SITUATIONS,
      })
      .andWhere('si.cfop_code IN (:...cfopCodes)', {
        cfopCodes: CONSIDERED_CFOPS,
      })
      .groupBy('EXTRACT(YEAR FROM si.date)')
      .addGroupBy('EXTRACT(MONTH FROM si.date)')
      .orderBy('year', 'DESC')
      .addOrderBy('month', 'DESC');

    const rows = await qb.getRawMany<{
      year: number;
      month: number;
      quantity: number;
      weight_in_kg: number;
      value: number;
    }>();

    const result: ByMonthAgg = {};
    rows.forEach((row) => {
      const key = `${row.year}-${String(row.month).padStart(2, '0')}`;

      result[key] = {
        value: row.value,
        quantity: row.quantity,
        weightInKg: row.weight_in_kg,
      };
    });

    return result;
  }

  private async getBillingsTotals() {
    const qb = this.datasource
      .getRepository(Invoice)
      .createQueryBuilder('si')
      .select([
        `COUNT(*) AS quantity`,
        `SUM(CAST(si.weight_in_kg AS numeric)) AS weight_in_kg`,
        `SUM(CAST(si.total_price AS numeric)) AS value`,
      ])
      .where('si.nf_situation IN (:...nfSituation)', {
        nfSituation: CONSIDERED_NF_SITUATIONS,
      })
      .andWhere('si.cfop_code IN (:...cfopCodes)', {
        cfopCodes: CONSIDERED_CFOPS,
      });

    // get raw
    const row = await qb.getRawOne<{
      quantity: number;
      weight_in_kg: number;
      value: number;
    }>();

    return {
      quantity: row.quantity,
      weightInKg: row.weight_in_kg,
      value: row.value,
    };
  }

  // return occurrences by type
  private async getReturnOccurrencesByReturnType() {
    return this.datasource
      .getRepository(ReturnOccurrence)
      .createQueryBuilder('sro')
      .select([
        'sro.returnType AS returnType',
        'COALESCE(SUM(sro.returnValue), 0) AS value',
        'COALESCE(SUM(sro.returnWeightInKg), 0) AS weightInKg',
      ])
      .groupBy('sro.returnType')
      .getRawMany<{
        returnType: string;
        value: string;
        weightInKg: string;
      }>();
  }

  // return occurrences by month
  private async getReturnOccurrencesByMonth() {
    return this.datasource
      .getRepository(ReturnOccurrence)
      .createQueryBuilder('sro')
      .select([
        'EXTRACT(YEAR FROM sro.date) AS year',
        'EXTRACT(MONTH FROM sro.date) AS month',
        'COALESCE(SUM(sro.returnValue), 0) AS value',
        'COALESCE(SUM(sro.returnWeightInKg), 0) AS weightInKg',
      ])
      .groupBy('EXTRACT(YEAR FROM sro.date)')
      .addGroupBy('EXTRACT(MONTH FROM sro.date)')
      .orderBy('year', 'DESC')
      .addOrderBy('month', 'DESC')
      .getRawMany<{
        year: string;
        month: string;
        value: string;
        weightInKg: string;
      }>();
  }

  // return occurrences totals
  private async getReturnOccurrencesTotals() {
    return this.datasource
      .getRepository(ReturnOccurrence)
      .createQueryBuilder('sro')
      .select([
        'COALESCE(SUM(sro.returnValue), 0) AS value',
        'COALESCE(SUM(sro.returnWeightInKg), 0) AS weightInKg',
      ])
      .getRawOne<{
        value: string;
        weightInKg: string;
      }>();
  }

  // slaughters totals
  private async getSlaughtersTotals() {
    return this.datasource
      .getRepository(CattleSlaughter)
      .createQueryBuilder('scs')
      .select([
        'COUNT(*) AS count',
        'COALESCE(SUM(scs.quantity), 0) AS quantity',
        'COALESCE(SUM(scs.weightInKg), 0) AS weightInKg',
      ])
      .getRawOne<{
        count: string;
        quantity: string;
        weightInKg: string;
      }>();
  }

  // slaughters by month
  private async getSlaughtersByMonth() {
    return this.datasource
      .getRepository(CattleSlaughter)
      .createQueryBuilder('scs')
      .select([
        'EXTRACT(YEAR FROM scs.date) AS year',
        'EXTRACT(MONTH FROM scs.date) AS month',
        'COUNT(*) AS count',
        'COALESCE(SUM(scs.quantity), 0) AS quantity',
        'COALESCE(SUM(scs.weightInKg), 0) AS weightInKg',
      ])
      .groupBy('EXTRACT(YEAR FROM scs.date)')
      .addGroupBy('EXTRACT(MONTH FROM scs.date)')
      .orderBy('year', 'DESC')
      .addOrderBy('month', 'DESC')
      .getRawMany<{
        year: string;
        month: string;
        count: string;
        quantity: string;
        weightInKg: string;
      }>();
  }

  // stock production
  private async getStockProductionTotals() {
    return this.datasource
      .getRepository(ProductionMovement)
      .createQueryBuilder('spm')
      .select([
        'COALESCE(SUM(spm.quantity), 0) AS quantity',
        'COALESCE(SUM(spm.weightInKg), 0) AS weightInKg',
      ])
      .where('spm.movementType = :movementType', { movementType: 'SAIDA' })
      .getRawOne<{
        quantity: string;
        weightInKg: string;
      }>();
  }

  private async getStockProductionByMonth() {
    return this.datasource
      .getRepository(ProductionMovement)
      .createQueryBuilder('spm')
      .select([
        'EXTRACT(YEAR FROM spm.date) AS year',
        'EXTRACT(MONTH FROM spm.date) AS month',
        'COALESCE(SUM(spm.quantity), 0) AS quantity',
        'COALESCE(SUM(spm.weightInKg), 0) AS weightInKg',
      ])
      .where('spm.movementType = :movementType', { movementType: 'SAIDA' })
      .groupBy('EXTRACT(YEAR FROM spm.date)')
      .addGroupBy('EXTRACT(MONTH FROM spm.date)')
      .orderBy('year', 'DESC')
      .addOrderBy('month', 'DESC')
      .getRawMany<{
        year: string;
        month: string;
        quantity: string;
        weightInKg: string;
      }>();
  }

  private async getStockProductionByQuarter() {
    return this.datasource
      .getRepository(ProductionMovement)
      .createQueryBuilder('spm')
      .select([
        'spm.productQuarter AS productQuarter',
        'COALESCE(SUM(spm.quantity), 0) AS quantity',
        'COALESCE(SUM(spm.weightInKg), 0) AS weightInKg',
      ])
      .where('spm.movementType = :movementType', { movementType: 'SAIDA' })
      .groupBy('spm.productQuarter')
      .getRawMany<{
        productQuarter: string;
        quantity: string;
        weightInKg: string;
      }>();
  }

  private async getStockProductionByProduct() {
    return this.datasource
      .getRepository(ProductionMovement)
      .createQueryBuilder('spm')
      .select([
        'spm.productCode AS productCode',
        'spm.productName AS productName',
        'COALESCE(SUM(spm.quantity), 0) AS quantity',
        'COALESCE(SUM(spm.weightInKg), 0) AS weightInKg',
      ])
      .where('spm.movementType = :movementType', { movementType: 'SAIDA' })
      .groupBy('spm.productCode')
      .addGroupBy('spm.productName')
      .orderBy('spm.productName', 'ASC')
      .getRawMany<{
        productCode: string;
        productName: string;
        quantity: string;
        weightInKg: string;
      }>();
  }

  // freights by status
  // freights by freightCompany

  // stock by company
}
