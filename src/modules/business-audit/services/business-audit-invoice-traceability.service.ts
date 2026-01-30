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
import { CONSIDERED_CFOPS } from '../constants/considered-cfops';
import { OrderSituationEnum } from '../enums/order-situation.enum';
import { GetOrderLineItem } from '../types/get-order-line.type';
import { StringUtils } from '@/modules/utils/services/string.utils';
import { InvoiceAgg } from '../types/get-sales-audit-data.type';
import { Company } from '@/core/entities/sensatta/company.entity';

@Injectable()
export class BusinessAuditInvoiceTraceabilityService {
  constructor(private readonly datasource: DataSource) {}

  // METODOS PRINCIPAIS
  async getData({
    startDate,
    endDate,
    companyCodes,
    clientCodes,
    salesRepresentativeCodes,
  }: {
    startDate?: Date;
    endDate?: Date;
    companyCodes?: string[];
    clientCodes?: string[];
    salesRepresentativeCodes?: string[];
  }) {
    /**
     * Map de refaturamentos p/ emp - OK
     * - emp
     * - qtd
     * - qtd %
     * - $ fat
     * - $ tab
     * - $ dif
     * - % dif
     */

    /**
     * Lista de nfs venda - OK
     * Lista de nfs refaturadas - OK
     * Detalhes de nfs
     */

    /**
     * KPIs - OK
     * # Visão geral
     * QTD NFs
     * FAT INICIAL $
     * FAT TABELA $
     * DEVOLUCOES $
     * REFAT $
     * FAT FINAL
     *
     * # Estudo refat
     * $ C1
     * $ C1 reteve
     * $ Refat demais clientes
     * $ REFAT FINAL
     * DESC $ e %
     *
     * # Totais
     * QTD NFs
     * FAT FINAL
     * DESC INICIAL $ e %
     * DESC REFAT $ e %
     * DESC FINAL $ e %
     */

    // reInvoicingsAll => todos os refaturamentos, mesmo que originados de vendas de outro range de datas
    const { reInvoicings: reInvoicingsAll, salesByInvoice } =
      await this.getSalesAndReinvoicings({
        startDate,
        endDate,
        companyCodes,
        clientCodes,
        salesRepresentativeCodes,
      });
    const reInvoicings: Record<string, InvoiceAgg> = {};

    const reinvoicingsTraceability = await this.getReinvoicingHistory({
      startDate,
      endDate,
      companyCodes,
      clientCodes,
      salesRepresentativeCodes,
    });

    reinvoicingsTraceability.forEach((i) => {
      reInvoicings[i.nfNumber] = {
        date: i.reInvoicingDate,
        companyCode: i.companyCode,
        companyName: i.companyName,
        market: i.reInvoicingMarket as MarketEnum,
        orderNumber: i.reInvoicingOrderId,
        nfNumber: i.reInvoicingNfNumber,
        clientCode: i.reInvoicingClientCode,
        clientName: i.reInvoicingClientName,
        totalKg: i.reInvoicingWeightInKg,
        totalFatValue: i.reInvoicingValue,
        totalTableValue: i.reInvoicingTableValue,
        totalDiff: i.reInvoicingValue - i.reInvoicingTableValue,
        additionPercent: 0,
        additionValue: 0,
        discountPercent: 0,
        discountValue: 0,
        percentValue: 0,
        referenceTableNumber: '',
        salesCount: 0,
        totalDiffPercent: 0,
      };
    });

    // maps
    const salesByCompanyMap = new Map<
      string,
      {
        companyCode: string;
        companyName: string;
        quantity: number;
        quantityPercent: number;
        invoiceValue: number;
        referenceTableValue: number;
        difValue: number;
        difPercent: number;
      }
    >();
    const salesByInvoiceTotals = Object.values(salesByInvoice).reduce(
      (acc, item) => ({
        quantity: acc.quantity + 1,
        fatValue: acc.fatValue + item.totalFatValue,
        tableValue: acc.tableValue + item.totalTableValue,
        dif: acc.dif + item.totalDiff,
      }),
      { quantity: 0, fatValue: 0, tableValue: 0, dif: 0 },
    );
    const reInvoicingsTraceabilityTotals = reinvoicingsTraceability.reduce(
      (acc, item) => ({
        returnOccurrencesValue: acc.returnOccurrencesValue + item.returnValue,
        reInvoicingsValue: acc.reInvoicingsValue + item.reInvoicingValue,
        invoicesValue: acc.invoicesValue + item.invoicingValue,
        invoicesProportionalValue:
          acc.invoicesProportionalValue + item.invoicingValueProportional,
      }),
      {
        returnOccurrencesValue: 0,
        reInvoicingsValue: 0,
        invoicesValue: 0,
        invoicesProportionalValue: 0,
      },
    );
    const kpis = {
      invoiceQuantity: 0,
      initialFatValue: 0,
      initialTableValue: 0,
      returnOccurrencesValue: 0,
      reInvoicingsValue: 0,
      finalFatValue: 0,
    };
    const reInvoicingsTotals = {
      reInvoicingQuantity: 0,
      reInvoicingQuantityPercent: 0,
      invoicesValue: 0,
      invoicesProportionalValue: 0,
      reInvoicingsValue: 0,
      finalValue: 0,
      difValue: 0,
      difPercent: 0,
    };
    const totals = {
      quantityNf: 0,
      finalValue: 0,
      initialDifValue: 0,
      initialDifPercent: 0,
      reInvoicingDifValue: 0,
      reInvoicingDifPercent: 0,
      totalDifValue: 0,
      totalDifPercent: 0,
    };

    for (const item of Object.values(salesByInvoice)) {
      const companyKey = `${item.companyCode} - ${item.companyName}`;
      if (!salesByCompanyMap.has(companyKey)) {
        salesByCompanyMap.set(companyKey, {
          companyCode: item.companyCode,
          companyName: item.companyName,
          quantity: 0,
          quantityPercent: 0,
          invoiceValue: 0,
          referenceTableValue: 0,
          difValue: 0,
          difPercent: 0,
        });
      }

      const currentMap = salesByCompanyMap.get(companyKey);
      currentMap.quantity += 1;
      currentMap.invoiceValue += item.totalFatValue;
      currentMap.referenceTableValue += item.totalTableValue;
      currentMap.difValue += item.totalFatValue - item.totalTableValue;
    }

    for (const [, obj] of salesByCompanyMap) {
      obj.quantityPercent = obj.quantity / salesByInvoiceTotals.quantity;
      obj.difPercent = obj.difValue / salesByInvoiceTotals.dif;
    }

    // KPIs
    kpis.invoiceQuantity = salesByInvoiceTotals.quantity;
    kpis.initialFatValue = salesByInvoiceTotals.fatValue;
    kpis.initialTableValue = salesByInvoiceTotals.tableValue;
    kpis.returnOccurrencesValue =
      reInvoicingsTraceabilityTotals.returnOccurrencesValue;
    kpis.reInvoicingsValue = reInvoicingsTraceabilityTotals.reInvoicingsValue;
    kpis.finalFatValue =
      kpis.initialFatValue -
      kpis.returnOccurrencesValue +
      kpis.reInvoicingsValue;

    // ESTUDO REFAT
    reInvoicingsTotals.reInvoicingQuantity = new Set(
      reinvoicingsTraceability.map((i) => i.reInvoicingNfNumber),
    ).size;
    reInvoicingsTotals.reInvoicingQuantityPercent =
      reInvoicingsTotals.reInvoicingQuantity / kpis.invoiceQuantity;
    reInvoicingsTotals.invoicesValue =
      reInvoicingsTraceabilityTotals.invoicesValue;
    reInvoicingsTotals.invoicesProportionalValue =
      reInvoicingsTraceabilityTotals.invoicesProportionalValue;
    reInvoicingsTotals.reInvoicingsValue =
      reInvoicingsTraceabilityTotals.reInvoicingsValue;
    reInvoicingsTotals.finalValue =
      reInvoicingsTotals.invoicesProportionalValue +
      reInvoicingsTotals.reInvoicingsValue;
    reInvoicingsTotals.difValue =
      reInvoicingsTotals.finalValue - reInvoicingsTotals.invoicesValue;
    reInvoicingsTotals.difPercent =
      Math.abs(reInvoicingsTotals.difValue) /
      (reInvoicingsTotals.invoicesValue || 1);

    // TOTAIS
    totals.quantityNf =
      salesByInvoiceTotals.quantity + reInvoicingsTotals.reInvoicingQuantity;
    totals.finalValue = kpis.finalFatValue;
    totals.initialDifValue = kpis.initialFatValue - kpis.initialTableValue;
    totals.initialDifPercent =
      totals.initialDifValue / (kpis.initialTableValue || 1);
    totals.reInvoicingDifValue = reInvoicingsTotals.difValue;
    totals.reInvoicingDifPercent =
      totals.reInvoicingDifValue / (reInvoicingsTotals.invoicesValue || 1);
    totals.totalDifValue = totals.initialDifValue + totals.reInvoicingDifValue;
    totals.totalDifPercent = totals.totalDifValue / (kpis.initialFatValue || 1);

    const getSalesAndReInvoicingsTotals = (data: Record<string, InvoiceAgg>) =>
      Object.values(data).reduce(
        (acc, i) => ({
          weightInKg: acc.weightInKg + i.totalKg,
          totalFatValue: acc.totalFatValue + i.totalFatValue,
          totalTableValue: acc.totalTableValue + i.totalTableValue,
          totalDiff: acc.totalDiff + i.totalDiff,
        }),
        {
          weightInKg: 0,
          totalFatValue: 0,
          totalTableValue: 0,
          totalDiff: 0,
        },
      );

    const test = Object.fromEntries(salesByCompanyMap);
    const salesByCompanyTotals = Object.values(test).reduce(
      (acc, item) => ({
        quantity: acc.quantity + item.quantity,
        quantityPercent: acc.quantityPercent + item.quantityPercent,
        invoiceValue: acc.invoiceValue + item.invoiceValue,
        referenceTableValue: acc.referenceTableValue + item.referenceTableValue,
        difValue: acc.difValue + item.difValue,
        difPercent: 0,
      }),
      {
        quantity: 0,
        quantityPercent: 0,
        invoiceValue: 0,
        referenceTableValue: 0,
        difValue: 0,
        difPercent: 0,
      },
    );

    salesByCompanyTotals.difPercent =
      salesByCompanyTotals.difValue / salesByCompanyTotals.referenceTableValue;

    return {
      salesByInvoice: {
        totals: getSalesAndReInvoicingsTotals(salesByInvoice),
        data: salesByInvoice,
      },
      reInvoicings: {
        totals: getSalesAndReInvoicingsTotals(reInvoicings),
        data: reInvoicings,
      },
      salesByCompany: {
        totals: salesByCompanyTotals,
        data: Object.fromEntries(salesByCompanyMap),
      },
      reinvoicingsTraceability,
      kpis,
      reInvoicingsTotals,
      totals,
    };
  }

  async getSalesAndReinvoicings({
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
  }) {
    const orderLines = await this.getOrdersLines({
      startDate,
      endDate,
      priceConsideration,
      market,
      nfNumber,
      companyCodes,
      clientCodes,
      salesRepresentativeCodes,
    });

    const aggregateInvoiceData = (
      orderLine: GetOrderLineItem,
      map: Map<string, InvoiceAgg>,
    ) => {
      const invoicingValue = Number(orderLine.totalValue ?? 0);
      const tableValue = Number(
        orderLine.referenceTableUnitValue * orderLine.weightInKg,
      );
      const difValue = invoicingValue - tableValue;
      const weightInKg = Number(orderLine.weightInKg ?? 0);

      // 1) Agrupar por NF + Pedido
      const invoiceKey = `${orderLine.nfId ?? 'nof'}`;
      if (!map.has(invoiceKey)) {
        map.set(invoiceKey, {
          companyCode: orderLine.companyCode,
          companyName: orderLine.companyName,
          date: orderLine.billingDate,
          nfNumber: orderLine.nfNumber,
          orderNumber: orderLine.orderId,
          orderCategory: orderLine.category,
          cfopCode: orderLine.cfopCode,
          cfopDescription: orderLine.cfopDescription,
          clientCode: orderLine.clientCode,
          clientName: orderLine.clientName,
          city: orderLine.city,
          uf: orderLine.uf,
          representativeCode: orderLine.salesRepresentativeCode,
          representativeName: orderLine.salesRepresentativeName,
          paymentTerm: orderLine.paymentTerm,
          market: orderLine.market,
          currency: orderLine.currency,
          salesCount: 0,
          totalFatValue: 0,
          totalTableValue: 0,
          totalDiff: 0,
          totalDiffPercent: 0,
          additionPercent: 0,
          additionValue: 0,
          discountPercent: 0,
          discountValue: 0,
          totalKg: 0,
          percentValue: 0,
          referenceTableNumber: orderLine.referenceTableNumber,
        });
      }
      const currentMap = map.get(invoiceKey)!;
      currentMap.salesCount += 1;
      currentMap.totalFatValue += invoicingValue;
      currentMap.totalTableValue += tableValue;
      currentMap.totalDiff += difValue;
      currentMap.totalKg += weightInKg;
      if (difValue > 0) {
        currentMap.additionValue += invoicingValue - tableValue;
      } else {
        currentMap.discountValue += tableValue - invoicingValue;
      }
    };

    const salesByInvoice = new Map<string, InvoiceAgg>();
    const reInvoicingsByInvoice = new Map<string, InvoiceAgg>();

    for (const orderLine of orderLines) {
      // FATURAMENTOS
      if (StringUtils.ILike('VEN%', orderLine.category)) {
        aggregateInvoiceData(orderLine, salesByInvoice);
        continue;
      }

      // REFATURAMENTOS
      if (StringUtils.ILike('REFAT%', orderLine.category)) {
        aggregateInvoiceData(orderLine, reInvoicingsByInvoice);
      }
    }

    return {
      salesByInvoice: Object.fromEntries(salesByInvoice),
      reInvoicings: Object.fromEntries(reInvoicingsByInvoice),
    };
  }

  async getReinvoicingHistory({
    startDate,
    endDate,
    nfNumber,
    companyCodes,
    clientCodes,
    salesRepresentativeCodes,
  }: {
    startDate?: Date;
    endDate?: Date;
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

        'sc.name AS company_name',
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
        'si2_base.nf_id as "nf_id_reinvoicing"',
        'si2_base.nf_number AS "nf_number_reinvoicing"',
        'si2_base.nf_situation AS "nf_situation_reinvoicing"',
        'so2.market as "market_reinvoicing"',
        'so2.order_id as "order_id_reinvoicing"',
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
        '"T".return_nf AS "return_nf"',
        '"T".occurrence_cause AS "occurrence_cause"',
        '"T".observation AS "observation"',
        '"T".product_code as "return_product_code"',
        '"T".product_name as "return_product_name"',
        '"T".return_weight_in_kg as "return_weight_in_kg"',
        '"T".return_value as "return_value"',

        // ===========================
        // REFATURAMENTO (AGREGADO - LATERAL)
        // ===========================
        'si2_agg.date AS "agg_date_reinvoicing"',
        'si2_agg.product_reinvoicing AS "agg_product_reinvoicing"',
        'si2_agg.weight_in_kg_reinvoicing AS "agg_weight_in_kg_reinvoicing"',
      ])
      .leftJoin(Company, 'sc', 'sc.sensatta_code = thr."CODIGO_EMPRESA"')
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
      // SUBQUERY OCORRÊNCIAS
      // ===========================
      .leftJoin(
        (subQ) =>
          subQ
            .select([
              'sro.occurrence_number AS occurrence_number',
              'sro.occurrence_cause AS occurrence_cause',
              'sro.return_nf AS return_nf',
              'sro.product_code as product_code',
              'sro.product_name as product_name',
              'sro.return_type AS return_type',
              'sro.observation AS observation',
              'SUM(sro.return_weight_in_kg) as return_weight_in_kg',
              'SUM(sro.return_value) as return_value',
            ])
            .from(ReturnOccurrence, 'sro')
            .groupBy('sro.occurrence_number')
            .addGroupBy('sro.occurrence_cause')
            .addGroupBy('sro.return_nf')
            .addGroupBy('sro.product_code')
            .addGroupBy('sro.product_name')
            .addGroupBy('sro.return_type')
            .addGroupBy('sro.observation'),

        'T',
        '"T".occurrence_number = thr."BO" AND "T".product_code = "si".product_code',
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
    if (salesRepresentativeCodes) {
      qb.andWhere(
        'si.sales_representative_code IN (:...salesRepresentativeCodes)',
        { salesRepresentativeCodes },
      );
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

    console.log('query', qb.getSql());
    const history = await qb.getRawMany<GetReinvoicingHistoryItemRaw>();
    console.log('traceability', history.length);
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
        companyName: row.company_name,
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
        reInvoicingNfId: row.nf_id_reinvoicing,
        reInvoicingNfNumber: row.nf_number_reinvoicing,
        reInvoicingNfSituation: row.nf_situation_reinvoicing,
        reInvoicingCategory: row.category_reinvoicing,
        reInvoicingMarket: row.market_reinvoicing,
        reInvoicingOrderId: row.order_id_reinvoicing,
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
        occurrenceNf: row.return_nf,
        occurrenceNfProductId: `${row.return_nf}${row.return_product_code}`,
        returnWeightInKg: row.return_weight_in_kg,
        returnValue: row.return_value,
        reinvoicingSequence: row.SEQUENCIA_REFATURAMENTO,
        returnType: row.return_type,
        observation: row.observation,
        returnProductCode: row.return_product_code,
        returnProductName: row.return_product_name,

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
          // transormar esse find dps em um map para performar melhro
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
            companyName: row.company_name,
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
            reInvoicingNfId: row.nf_id_reinvoicing,

            reInvoicingNfNumber: row.nf_number_reinvoicing,
            reInvoicingNfSituation: row.nf_situation_reinvoicing,
            reInvoicingCategory: row.category_reinvoicing,
            reInvoicingMarket: '',
            reInvoicingOrderId: '',
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
            occurrenceNf: row.return_nf,
            occurrenceNfProductId: `${row.return_nf}${row.return_product_code}`,
            returnWeightInKg: 0,
            returnValue: 0,
            reinvoicingSequence: row.SEQUENCIA_REFATURAMENTO,
            returnType: row.return_type,
            observation: row.observation,
            returnProductCode: row.return_product_code,
            returnProductName: row.return_product_name,

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
        item.returnWeightInKg = 0;
        item.returnValue = 0;
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

  // FETCH DE DADOS
  async getOrdersLines({
    startDate,
    endDate,
    productCode,
    clientCodes,
    salesRepresentativeCodes,
    priceConsideration,
    nfNumber,
    nfId,
    market,
    companyCodes,
  }: {
    startDate?: Date;
    endDate?: Date;
    productCode?: string;
    clientCodes?: string[];
    salesRepresentativeCodes?: string[];
    priceConsideration?: OrderPriceConsiderationEnum;
    nfNumber?: string;
    nfId?: string;
    market?: MarketEnum;
    companyCodes?: string[];
  }) {
    const qb = this.datasource
      .getRepository(OrderLine)
      .createQueryBuilder('so')
      .leftJoinAndSelect(
        'sensatta_companies',
        'sc',
        'sc.sensatta_code = so.companyCode',
      )
      .leftJoinAndSelect(
        'sensatta_invoices',
        'sinv',
        'sinv.nf_id = so.nf_id AND sinv.product_code = so.productCode',
      )
      .leftJoinAndSelect(
        (subQuery) =>
          subQuery
            .select('*')
            .from('sensatta_clients', 'sc2')
            .distinctOn(['sc2.sensatta_code'])
            .orderBy('sc2.sensatta_code', 'ASC')
            .addOrderBy('sc2.id', 'DESC'),
        'sc2',
        'sc2.sensatta_code = so.clientCode',
      );

    qb.where('1=1')
      .andWhere('so.situation = :situation', {
        situation: OrderSituationEnum.INVOICED,
      })
      .andWhere('so.cfop_code IN (:...cfops)', {
        cfops: CONSIDERED_CFOPS,
      });
    // .andWhere('so.category_code IN (:...categoryCodes)', {
    //   categoryCodes: CONSIDERED_ORDER_CATEGORIES,
    // });

    if (startDate) {
      qb.andWhere('so.billing_date >= :startDate', { startDate });
    }
    if (endDate) {
      qb.andWhere('so.billing_date <= :endDate', { endDate });
    }
    if (productCode) {
      qb.andWhere('so.productCode = :productCode', { productCode });
    }
    if (clientCodes) {
      qb.andWhere('so.clientCode IN (:...clientCodes)', { clientCodes });
    }
    if (salesRepresentativeCodes) {
      qb.andWhere(
        'so.salesRepresentativeCode IN (:...salesRepresentativeCodes)',
        {
          salesRepresentativeCodes,
        },
      );
    }
    if (nfNumber) {
      qb.andWhere('so.nfNumber = :nfNumber', { nfNumber });
    }
    if (nfId) {
      qb.andWhere('so.nfId = :nfId', { nfId });
    }
    if (market) {
      qb.andWhere('so.market = :market', { market });
    }
    if (companyCodes) {
      qb.andWhere('so.company_code IN (:...companyCodes)', {
        companyCodes,
      });
    }

    switch (priceConsideration) {
      case OrderPriceConsiderationEnum.OVER_TABLE_PRICE:
        qb.andWhere('so.saleUnitValue > so.referenceTableUnitValue');
        break;
      case OrderPriceConsiderationEnum.UNDER_TABLE_PRICE:
        qb.andWhere('so.saleUnitValue < so.referenceTableUnitValue');
        break;
      case OrderPriceConsiderationEnum.NONE:
      default:
        break;
    }

    const result = await qb.getRawMany();

    const data: GetOrderLineItem[] = [];

    for (const item of result) {
      const payload: GetOrderLineItem = {
        id: item.so_id,
        billingDate: item.so_billing_date,
        issueDate: item.so_issue_date,
        companyCode: item.so_company_code,
        companyName: item.sc_name, // <-- pega de sc.nam,
        orderId: item.so_order_id,
        situation: item.so_situation,
        market: item.so_market,
        paymentTerm: item.so_payment_term,
        clientCode: item.so_client_code,
        clientName: item.so_client_name,
        city: item.city,
        uf: item.uf,
        salesRepresentativeCode: item.so_sales_representative_code,
        salesRepresentativeName: item.so_sales_representative_name,
        category: item.so_category,
        productLineCode: item.so_product_line_code,
        productLineName: item.so_product_line_name,
        productCode: item.so_product_code,
        productName: item.so_product_name,
        quantity: item.so_quantity,
        weightInKg: item.sinv_weight_in_kg,
        currency: item.so_currency,
        costValue: item.so_cost_value,
        discountPromotionValue: item.so_discount_promotion_value,
        saleUnitValue: item.so_sale_unit_value,
        referenceTableUnitValue: item.so_reference_table_unit_value,
        totalValue: item.sinv_total_price,
        receivableTitleValue: item.so_receivable_title_value,
        referenceTableId: item.so_reference_table_id,
        referenceTableNumber: item.so_reference_table_number,
        referenceTableDescription: item.so_reference_table_description,
        freightCompanyId: item.so_freight_company_id,
        freightCompanyName: item.so_freight_company_name,
        description: item.so_description,
        receivableTitleId: item.so_receivable_title_id,
        receivableTitleNumber: item.so_receivable_title_number,
        receivableTitleObservation: item.so_receivable_title_observation,
        accountGroupCode: item.so_account_group_code,
        accountGroupName: item.so_account_group_name,
        accountCode: item.so_account_code,
        accountName: item.so_account_name,
        nfId: item.so_nf_id,
        nfNumber: item.so_nf_number,
        cfopCode: item.so_cfop_code,
        cfopDescription: item.so_cfop_description,
        createdAt: item.so_created_at,
        invoicingValue: 0,
        tableValue: 0,
        dif: 0,
        difPercent: 0,
        additionPercent: 0,
        discountPercent: 0,
      };
      const invoicingValue = Number(payload.totalValue ?? 0);
      const tableValue = Number(
        payload.referenceTableUnitValue * payload.weightInKg,
      );
      const difValue = invoicingValue - tableValue;
      const difPercent = NumberUtils.nb4(difValue / (tableValue || 1));

      payload.invoicingValue = invoicingValue;
      payload.tableValue = tableValue;
      payload.dif = difValue;
      payload.difPercent = difPercent;
      if (difValue > 0) {
        payload.additionPercent = NumberUtils.nb4(
          invoicingValue / tableValue - 1,
        );
      } else {
        payload.discountPercent = NumberUtils.nb4(
          1 - invoicingValue / tableValue,
        );
      }
      data.push(payload);
    }
    return data;
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
   * Lista de nfs venda
   * Lista de nfs refaturadas
   * Detalhes de nfs
   */

  /**
   * KPIs
   * # Visão geral
   * QTD NFs
   * FAT INICIAL $
   * FAT TABELA $
   * DEVOLUCOES $
   * REFAT $
   * FAT FINAL
   *
   * # Estudo refat
   * $ C1
   * $ C1 reteve
   * $ Refat demais clientes
   * $ REFAT FINAL
   * DESC $ e %
   *
   * # Totais
   * QTD NFs
   * FAT FINAL
   * DESC INICIAL $ e %
   * DESC REFAT $ e %
   * DESC FINAL $ e %
   */
}
