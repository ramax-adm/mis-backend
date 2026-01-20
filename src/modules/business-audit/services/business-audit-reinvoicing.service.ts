import { TempHistoricoRefaturamento } from '@/core/entities/temp/temp-historico-refaturamento.entity';
import { Invoice } from '@/modules/sales/entities/invoice.entity';
import { OrderLine } from '@/modules/sales/entities/order-line.entity';
import { ReturnOccurrence } from '@/modules/sales/entities/return-occurrence.entity';
import { MarketEnum } from '@/modules/stock/enums/markets.enum';
import { DateUtils } from '@/modules/utils/services/date.utils';
import { NumberUtils } from '@/modules/utils/services/number.utils';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { OrderPriceConsiderationEnum } from '../enums/order-price-consideretion.enum';
import {
  GetReinvoicingHistoryItem,
  GetReinvoicingHistoryItemRaw,
} from '../types/get-reinvoicing-history.type';

@Injectable()
export class BusinessAuditReinvoicingService {
  constructor(private readonly datasource: DataSource) {}

  async getReinvoicingHistory({
    startDate,
    endDate,
    priceConsideration,
    market,
    nfNumber,
    companyCodes,
    clientCodes,
    salesRepresentativeCodes,
  }: {
    startDate?: Date;
    endDate?: Date;
    priceConsideration?: OrderPriceConsiderationEnum;
    market?: MarketEnum;
    nfNumber?: string;
    companyCodes?: string[];
    clientCodes?: string[];
    salesRepresentativeCodes?: string[];
  }): Promise<GetReinvoicingHistoryItem[]> {
    const lateralSubQuery = `
    SELECT
      si2."date",
      si2.nf_id,
      string_agg(
        si2.product_code || ' - ' || si2.product_name,
        ' | '
      ) AS product_reinvoicing,
      sum(si2.weight_in_kg) AS weight_in_kg_reinvoicing,
      sum(si2.total_price) AS invoicing_value_reinvoicing
    FROM dev.sensatta_invoices si2
    WHERE si2.nf_id = thr."ID_NF_REFATURAMENTO"
      AND NOT EXISTS (
        SELECT 1
        FROM dev.sensatta_invoices si_fat
        WHERE si_fat.nf_id = thr."ID_NF_FATURAMENTO"
          AND si_fat.product_code = si2.product_code
      )
    GROUP BY si2."date", si2.nf_id
  `;

    const qb = this.datasource
      .getRepository(TempHistoricoRefaturamento)
      .createQueryBuilder('thr')
      .select([
        // =====================================================
        // -------- TempHistoricoRefaturamento (thr)
        // =====================================================
        'thr.CODIGO_EMPRESA AS "CODIGO_EMPRESA"',
        'thr."BO" AS "BO"',
        'thr."ID_NF_FATURAMENTO" AS "ID_NF_FATURAMENTO"',
        'thr."ID_NF_REFATURAMENTO" AS "ID_NF_REFATURAMENTO"',
        'thr."NF_REFATURAMENTO" AS "NF_REFATURAMENTO"',
        'thr."SEQUENCIA_REFATURAMENTO" AS "SEQUENCIA_REFATURAMENTO"',

        // =====================================================
        // -------- Sensatta Invoices (si)
        // =====================================================
        'si.date AS "date"',
        'si.nf_number AS "nf_number"',
        'si.order_category AS "category"',
        'si.client_code AS "client_code"',
        'si.client_name AS "client_name"',
        'so.sales_representative_code AS "sales_representative_code"',
        'so.sales_representative_name AS "sales_representative_name"',
        'si.product_code AS "product_code"',
        'si.product_name AS "product_name"',
        'si.weight_in_kg AS "weight_in_kg"',
        'si.unit_price AS "sale_unit_price"',
        'so.reference_table_unit_value AS "table_unit_price"',
        'si.total_price AS "invoicing_value"',
        'so.reference_table_unit_value * si.weight_in_kg AS "table_value"',

        // =====================================================
        // -------- Sensatta Invoices Refaturamento (si2)
        // =====================================================
        'si2_base.date AS "date_reinvoicing"',
        'si2_base.nf_number AS "nf_number_reinvoicing"',
        'si2_base.nf_situation AS "nf_situation_reinvoicing"',
        'si2_base.order_category AS "category_reinvoicing"',
        'si2_item.product_code AS "product_code_reinvoicing"',
        'si2_item.product_name AS "product_name_reinvoicing"',
        'si2_base.client_code AS "client_code_reinvoicing"',
        'si2_base.client_name AS "client_name_reinvoicing"',
        'si2_item.weight_in_kg AS "weight_in_kg_reinvoicing"',
        'si2_item.unit_price AS "unit_price_reinvoicing"',
        'so2.reference_table_unit_value AS "table_unit_price_reinvoicing"',
        'si2_item.total_price AS "invoicing_value_reinvoicing"',
        'so2.reference_table_unit_value * si2_item.weight_in_kg AS "table_value_reinvoicing"',

        // =====================================================
        // -------- Ocorrências (subquery T)
        // =====================================================
        '"T".occurrence_number AS "occurrence_number"',
        '"T".return_type AS "return_type"',
        '"T".occurrence_cause AS "occurrence_cause"',
        '"T".observation AS "observation"',

        // ===========================
        // REFATURAMENTO (AGREGADO - LATERAL)
        // ===========================
        'si2_agg.date AS "agg_date_reinvoicing"',
        'si2_agg.product_reinvoicing AS "agg_product_reinvoicing"',
        'si2_agg.weight_in_kg_reinvoicing AS "agg_weight_in_kg_reinvoicing"',
      ])
      // ===========================
      // SUBQUERY OCORRÊNCIAS
      // ===========================
      .leftJoin(
        (subQ) =>
          subQ
            .select([
              'sro.occurrence_number AS occurrence_number',
              'sro.occurrence_cause AS occurrence_cause',
              'sro.return_type AS return_type',
              'sro.observation AS observation',
            ])
            .from(ReturnOccurrence, 'sro')
            .groupBy('sro.occurrence_number')
            .addGroupBy('sro.occurrence_cause')
            .addGroupBy('sro.return_type')
            .addGroupBy('sro.observation'),

        'T',
        '"T".occurrence_number = thr."BO"',
      )
      // ===========================
      // FATURAMENTO
      // ===========================
      .leftJoin(Invoice, 'si', 'si.nf_id = thr."ID_NF_FATURAMENTO"')
      .leftJoin(
        OrderLine,
        'so',
        'so.nf_id = si.nf_id AND so.product_code = si.product_code',
      )
      // ===========================
      // REFATURAMENTO
      // ===========================
      .leftJoin(
        (subQ) =>
          subQ
            .select(['DISTINCT ON (i.nf_id) i.*'])
            .from(Invoice, 'i')
            .orderBy('i.nf_id')
            .addOrderBy('i.product_code'), // critério da "primeira"
        'si2_base',
        'si2_base.nf_id = thr."ID_NF_REFATURAMENTO"',
      )
      .leftJoin(
        Invoice,
        'si2_item',
        `si2_item.nf_id = thr."ID_NF_REFATURAMENTO"
           AND si.product_code = si2_item.product_code`,
      )
      .leftJoin(
        OrderLine,
        'so2',
        'so2.nf_id = si2_item.nf_id AND so2.product_code = si2_item.product_code',
      )
      // ===========================
      // REFATURAMENTO (AGREGADO - LATERAL)
      // ===========================
      .leftJoin(
        (qb) => {
          qb.getQuery = () => `LATERAL (${lateralSubQuery})`;
          qb.setParameters({});
          return qb;
        },
        'si2_agg',
        'true',
      )

      .where('1=1')
      .andWhere('thr."NF_REFATURAMENTO" is not null ');
    // .orderBy('si.date', 'ASC')
    // .addOrderBy('si.nf_number', 'ASC')
    // .addOrderBy('si2_base.nf_number', 'ASC')
    // .addOrderBy('si.product_code', 'ASC');

    if (startDate) {
      qb.andWhere('si.date >= :startDate', { startDate });
    }
    if (endDate) {
      qb.andWhere('si.date <= :endDate', { endDate });
    }
    if (clientCodes) {
      qb.andWhere('si.client_code IN (:...clientCodes)', { clientCodes });
    }
    // if (salesRepresentativeCodes) {
    //   qb.andWhere(
    //     'si.sales_representative_code IN (:...salesRepresentativeCodes)',
    //     {
    //       salesRepresentativeCodes,
    //     },
    //   );
    // }
    if (nfNumber) {
      qb.andWhere('thr."NF_FATURAMENTO" = :nfNumber', { nfNumber });
    }
    // if (market) {
    //   qb.andWhere('si.market = :market', { market });
    // }
    if (companyCodes) {
      qb.andWhere('thr."CODIGO_EMPRESA" IN (:...companyCodes)', {
        companyCodes,
      });
    }

    const history = await qb.getRawMany<GetReinvoicingHistoryItemRaw>();
    const noReinvoicingHistory = history.filter(
      (i) => !i.product_code_reinvoicing,
    );
    const reinvoicingHistory = history.filter(
      (i) => !!i.product_code_reinvoicing,
    );

    const response: GetReinvoicingHistoryItem[] = [];

    const noReivoicingHistoryMap = new Map<string, GetReinvoicingHistoryItem>();

    for (const row of reinvoicingHistory) {
      /////////////////////////////////////////////////////////////////////
      // DIFERENCES
      const difDays = DateUtils.getDifferenceInDays(
        row.date,
        row.date_reinvoicing,
      );
      const difWeightInKg = row.weight_in_kg_reinvoicing - row.weight_in_kg;
      const difSaleUnitPrice = row.unit_price_reinvoicing - row.sale_unit_price;

      // Se a diferença em KG for igual a 0, é uma devolução Integral
      // Caso contrario é devolução parcial
      let difValue = 0;
      if (NumberUtils.nequal(difWeightInKg, 0)) {
        difValue = row.invoicing_value_reinvoicing - row.invoicing_value;
      } else {
        difValue = row.weight_in_kg_reinvoicing * difSaleUnitPrice;
      }
      const difValuePercent =
        row.invoicing_value_reinvoicing / row.invoicing_value;

      response.push({
        companyCode: row.CODIGO_EMPRESA,
        date: row.date,
        nfNumber: row.nf_number,
        category: row.category,
        clientCode: row.client_code,
        clientName: row.client_name,
        productCode: row.product_code,
        productName: row.product_name,
        weightInKg: row.weight_in_kg,
        saleUnitPrice: row.sale_unit_price,
        tableUnitPrice: row.table_unit_price,
        invoicingValue: row.invoicing_value,
        salesRepresentativeCode: row.sales_representative_code,
        salesRepresentativeName: row.sales_representative_name,
        tableValue: row.table_value,

        reInvoicingDate: row.date_reinvoicing,
        reInvoicingNfNumber: row.nf_number_reinvoicing,
        reInvoicingNfSituation: row.nf_situation_reinvoicing,
        reInvoicingCategory: row.category_reinvoicing,
        reInvoicingProductCode: row.product_code_reinvoicing,
        reInvoicingProductName: row.product_name_reinvoicing,
        reInvoicingClientCode: row.client_code_reinvoicing,
        reInvoicingClientName: row.client_name_reinvoicing,
        reInvoicingWeightInKg: row.weight_in_kg_reinvoicing,
        reInvoicingUnitPrice: row.unit_price_reinvoicing,
        reInvoicingTableUnitPrice: row.table_unit_price_reinvoicing,
        reInvoicingValue: row.invoicing_value_reinvoicing,
        reInvoicingTableValue: row.table_value_reinvoicing,

        reInvoicingDif: difValue,
        difDays,
        difWeightInKg,
        difWeightInKgProportional: 0,
        difSaleUnitPrice,
        difValue,
        difValuePercent,

        occurrenceNumber: row.occurrence_number,
        occurrenceCause: row.occurrence_cause,
        reinvoicingSequence: row.SEQUENCIA_REFATURAMENTO,
        returnType: row.return_type,
        observation: row.observation,

        // Peso que ficou originalmente para o cliente 1
        // Valor faturado que ficou para o cliente 1 VFC1 (invoicing_value_proporcional)

        // Coluna de teste (Teste Valor Faturado Total) = VFC1 + Valor REFAT + ABS(DIF FAT)
        // weightInKgProportional: 0,
        invoicingValueProportional: 0,
        testFinalValue: 0,
        aggDateReinvoicing: row.agg_date_reinvoicing,
        aggProductReinvoicing: row.agg_product_reinvoicing,
        aggWeightInKgReinvoicing: row.agg_weight_in_kg_reinvoicing,
      });
    }

    // Produtos sem refaturamento (deduplicados)
    noReinvoicingHistory
      .filter(
        (item) =>
          !reinvoicingHistory.find(
            (i) =>
              i.nf_number === item.nf_number &&
              i.product_code === item.product_code,
          ),
      )
      .forEach((row) => {
        const key = `${row.CODIGO_EMPRESA}-${new Date(row.date).toISOString()}-${row.nf_number}-${row.product_code}`;

        if (!noReivoicingHistoryMap.has(key)) {
          noReivoicingHistoryMap.set(key, {
            companyCode: row.CODIGO_EMPRESA,
            date: row.date,
            nfNumber: row.nf_number,
            category: row.category,
            clientCode: row.client_code,
            clientName: row.client_name,
            productCode: row.product_code,
            productName: row.product_name,
            weightInKg: row.weight_in_kg,
            saleUnitPrice: row.sale_unit_price,
            tableUnitPrice: row.table_unit_price,
            invoicingValue: row.invoicing_value,
            salesRepresentativeCode: row.sales_representative_code,
            salesRepresentativeName: row.sales_representative_name,
            tableValue: row.table_value,

            reInvoicingDate: row.date_reinvoicing,
            reInvoicingNfNumber: row.nf_number_reinvoicing,
            reInvoicingNfSituation: row.nf_situation_reinvoicing,
            reInvoicingCategory: row.category_reinvoicing,
            reInvoicingProductCode: '',
            reInvoicingProductName: '',
            reInvoicingClientCode: '',
            reInvoicingClientName: '',
            reInvoicingWeightInKg: 0,
            reInvoicingUnitPrice: 0,
            reInvoicingTableUnitPrice: 0,
            reInvoicingValue: 0,
            reInvoicingTableValue: 0,
            reInvoicingDif: 0,
            difDays: 0,
            difWeightInKg: 0,
            difWeightInKgProportional: 0,
            difSaleUnitPrice: 0,
            difValue: 0,
            difValuePercent: 0,

            occurrenceNumber: row.occurrence_number,
            occurrenceCause: row.occurrence_cause,
            reinvoicingSequence: row.SEQUENCIA_REFATURAMENTO,
            returnType: row.return_type,
            observation: row.observation,

            //  weightInKgProportional: 0,
            invoicingValueProportional: 0,
            testFinalValue: 0,

            aggDateReinvoicing: row.agg_date_reinvoicing,
            aggProductReinvoicing: row.agg_product_reinvoicing,
            aggWeightInKgReinvoicing: row.agg_weight_in_kg_reinvoicing,
          });
        }
      });

    noReivoicingHistoryMap.forEach((item) => {
      response.push(item);
    });

    // soma total de KG refaturado por NF + produto
    const reinvoicingKgSumMap = new Map<string, number>();

    response.forEach((item) => {
      if (item.reInvoicingNfSituation === 'Cancelada') return;

      const key = `${item.companyCode}-${new Date(item.date).toISOString()}-${item.nfNumber}-${item.productCode}`;

      const current = reinvoicingKgSumMap.get(key) ?? 0;
      reinvoicingKgSumMap.set(key, current + (item.reInvoicingWeightInKg ?? 0));
    });

    const firstProductOccurrenceMap = new Map<string, boolean>();
    response.forEach((item) => {
      const key = `${item.companyCode}-${new Date(item.date).toISOString()}-${item.nfNumber}-${item.productCode}`;
      const isCanceledReinvoicing = item.reInvoicingNfSituation === 'Cancelada';

      const isNoReivoicing = !item.reInvoicingProductCode;

      // NF CANCELADA → SEMPRE ZERA e NÃO CONTA como primeira
      if (isCanceledReinvoicing) {
        item.weightInKg = 0;
        item.invoicingValue = 0;
        item.tableValue = 0;
        item.reInvoicingWeightInKg = 0;
        item.reInvoicingValue = 0;
        item.reInvoicingTableValue = 0;
        // item.saleUnitPrice = 0;
        // item.tableUnitPrice = 0;
        item.difDays = 0;
        item.difSaleUnitPrice = 0;
        item.difValue = 0;
        item.difValuePercent = 0;
        item.difWeightInKg = 0;

        return;
      }

      if (!firstProductOccurrenceMap.has(key)) {
        firstProductOccurrenceMap.set(key, true);
        const totalReinvoicedKg = reinvoicingKgSumMap.get(key) ?? 0;
        if (!isNoReivoicing) {
          item.difWeightInKg = totalReinvoicedKg - item.weightInKg;
          // item. weightInKgProportional = 0
          item.invoicingValueProportional =
            Math.abs(item.difWeightInKg) * item.saleUnitPrice;

          return;
        }
      }

      item.weightInKg = 0;
      item.invoicingValue = 0;
      item.tableValue = 0;
      item.saleUnitPrice = 0;
      item.tableUnitPrice = 0;
      item.difWeightInKg = 0;
    });
    /**************************/

    return response.sort((a, b) => {
      // 1. date
      const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (dateDiff !== 0) return dateDiff;

      // 2. nf_number
      const nfDiff = Number(a.nfNumber) - Number(b.nfNumber);
      if (nfDiff !== 0) return nfDiff;

      // 3. nf_number reinvoicing (refaturamento)
      const nfReinvoicingDiff =
        Number(a.reInvoicingNfNumber ?? 0) - Number(b.reInvoicingNfNumber ?? 0);
      if (nfReinvoicingDiff !== 0) return nfReinvoicingDiff;

      // 4. product_code
      return String(a.productCode).localeCompare(String(b.productCode));
    });
  }

  /**
   * Map de refaturamentos p/ emp
   * - emp
   * - qtd
   * - qtd %
   * - $ fat
   * - $ tab
   * - $ dif
   * - % dif
   */

  /**
   * Lista de nfs refaturadas p/ emp
   * - dt fat
   * - nf fat
   * - cliente fat
   * - representante fat
   * - kg fat
   * - $ fat
   */

  /**
   * Detalhes de nfs refaturadas p/ emp
   * - produto
   *
   * FATURAMENTO
   * - dt fat
   * - nf fat
   * - cliente fat
   * - kg fat
   * - $ un fat
   * - $ un tab
   * - $ fat
   * - $ tab
   * - $ dif
   *
   * REFATURAMENTO
   * - dt refat
   * - nf refat
   * - cliente refat
   * - $ un fat
   * - $ un tab
   * - $ fat
   * - $ tab
   * - $ dif
   *
   * DIF
   * - dias
   * - kg
   * - $ un fat
   * - $ fat
   * - B.O
   * - N° refat
   * - motivo
   */

  /**
   *
   * TOTALIZADORES
   * NF ORIGINAL
   * - $ FAT C1 (1° cliente)
   * - $ Tab
   * - $ Dif
   *
   * NF REFATURAMENTO
   *
   *
   * DIFs
   * FAT FINAL - FAT
   * FAT FINAL - TAB
   * %
   */
}
