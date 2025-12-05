import { Invoice } from '@/modules/sales/entities/invoice.entity';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CONSIDERED_NF_SITUATIONS } from '../constants/considered-nf-situations';
import { CONSIDERED_CFOPS } from '../constants/considered-cfops';
import { ByMonthAgg } from '../types/get-overview-audit-data.type';

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

  getData() {}

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
      .createQueryBuilder()
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

  // return occurrences by month
  // return occurrences totals

  // slaughters

  // stock

  // freights by status
  // freights by freightCompany

  // stock by company
}
