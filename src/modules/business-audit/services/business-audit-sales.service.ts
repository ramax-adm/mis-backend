import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { CONSIDERED_CFOPS } from '../constants/considered-cfops';
import { OrderLine } from '@/modules/sales/entities/order-line.entity';
import {
  InvoiceAgg,
  ProductAgg,
  ClientAgg,
  SalesRepresentativeAgg,
  GetBusinessAuditSalesDataTotals,
} from '../types/get-sales-audit-data.type';
import { GetBusinessAuditSalesDataResponseDto } from '../dtos/response/get-business-sales-data-response.dto';
import { OrderSituationEnum } from '../enums/order-situation.enum';
import { OrderPriceConsiderationEnum } from '../enums/order-price-consideretion.enum';
import { MarketEnum } from '@/modules/stock/enums/markets.enum';
import { NumberUtils } from '@/modules/utils/services/number.utils';
import { GetOrderLineItem } from '../types/get-order-line.type';
import { TempHistoricoRefaturamento } from '@/core/entities/temp/temp-historico-refaturamento.entity';
import { Invoice } from '@/modules/sales/entities/invoice.entity';
import { ReturnOccurrence } from '@/modules/sales/entities/return-occurrence.entity';
import {
  GetReinvoicingHistoryItem,
  GetReinvoicingHistoryItemRaw,
} from '../types/get-reinvoicing-history.type';
import { DateUtils } from '@/modules/utils/services/date.utils';

@Injectable()
export class BusinessAuditSalesService {
  constructor(private readonly datasource: DataSource) {}

  // METODOS PRINCIPAIS
  async getSalesAuditData({
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
    const startTime = new Date().getTime();
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
    console.log(`orderLines time ${new Date().getTime() - startTime}ms`);

    // const orderLines = orderLinesInDatabase.filter((o) =>
    //   CONSIDERED_CFOPS.includes(o.cfopCode),
    // );

    const salesByInvoice = new Map<string, InvoiceAgg>();
    const salesByProduct = new Map<string, ProductAgg>();
    const salesByClient = new Map<string, ClientAgg>();
    const salesByRepresentative = new Map<string, SalesRepresentativeAgg>();

    for (const orderLine of orderLines) {
      const invoicingValue = Number(orderLine.totalValue ?? 0);
      const tableValue = Number(
        orderLine.referenceTableUnitValue * orderLine.weightInKg,
      );
      const difValue = invoicingValue - tableValue;
      const weightInKg = Number(orderLine.weightInKg ?? 0);

      // 1) Agrupar por NF + Pedido
      const invoiceKey = `${orderLine.nfId ?? 'nof'}`;
      if (!salesByInvoice.has(invoiceKey)) {
        salesByInvoice.set(invoiceKey, {
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
        });
      }
      const currentSalesByInvoice = salesByInvoice.get(invoiceKey)!;
      currentSalesByInvoice.salesCount += 1;
      currentSalesByInvoice.totalFatValue += invoicingValue;
      currentSalesByInvoice.totalTableValue += tableValue;
      currentSalesByInvoice.totalDiff += difValue;
      currentSalesByInvoice.totalKg += weightInKg;
      if (difValue > 0) {
        currentSalesByInvoice.additionValue += invoicingValue - tableValue;
      } else {
        currentSalesByInvoice.discountValue += tableValue - invoicingValue;
      }

      // 2) Agrupar por Produto
      const productKey = `${orderLine.productCode} - ${orderLine.productName}`;

      if (!salesByProduct.has(productKey)) {
        salesByProduct.set(productKey, {
          productCode: orderLine.productCode,
          productName: orderLine.productName,
          salesCount: 0,
          totalKg: 0,
          totalFatValue: 0,
          totalTableValue: 0,
          totalDiff: 0,
          totalDiffPercent: 0,
          additionPercent: 0,
          additionValue: 0,
          discountPercent: 0,
          discountValue: 0,
          percentValue: 0,
        });
      }
      const currentSalesByProduct = salesByProduct.get(productKey)!;
      currentSalesByProduct.salesCount += 1;
      currentSalesByProduct.totalKg += weightInKg;
      currentSalesByProduct.totalFatValue += invoicingValue;
      currentSalesByProduct.totalTableValue += tableValue;
      currentSalesByProduct.totalDiff += difValue;
      if (difValue > 0) {
        currentSalesByProduct.additionValue += invoicingValue - tableValue;
      } else {
        currentSalesByProduct.discountValue += tableValue - invoicingValue;
      }

      // 3) Agrupar por Cliente
      const clientKey = `${orderLine.clientCode} - ${orderLine.clientName}`;
      if (!salesByClient.has(clientKey)) {
        salesByClient.set(clientKey, {
          clientCode: orderLine.clientCode,
          clientName: orderLine.clientName,
          salesCount: 0,
          totalKg: 0,
          totalFatValue: 0,
          totalTableValue: 0,
          totalDiff: 0,
          totalDiffPercent: 0,
          additionPercent: 0,
          additionValue: 0,
          discountPercent: 0,
          discountValue: 0,
          percentValue: 0,
        });
      }
      const currentSalesByClient = salesByClient.get(clientKey)!;
      currentSalesByClient.salesCount += 1;
      currentSalesByClient.totalKg += weightInKg;
      currentSalesByClient.totalFatValue += invoicingValue;
      currentSalesByClient.totalTableValue += tableValue;
      currentSalesByClient.totalDiff += difValue;
      if (difValue > 0) {
        currentSalesByClient.additionValue += invoicingValue - tableValue;
      } else {
        currentSalesByClient.discountValue += tableValue - invoicingValue;
      }

      // 4) Agrupar por Representante
      const representativeKey = `${orderLine.salesRepresentativeCode} - ${orderLine.salesRepresentativeName}`;
      if (!salesByRepresentative.has(representativeKey)) {
        salesByRepresentative.set(representativeKey, {
          salesRepresentativeCode: orderLine.salesRepresentativeCode,
          salesRepresentativeName: orderLine.salesRepresentativeName,
          salesCount: 0,
          totalKg: 0,
          totalFatValue: 0,
          totalTableValue: 0,
          totalDiff: 0,
          totalDiffPercent: 0,
          additionPercent: 0,
          additionValue: 0,
          discountPercent: 0,
          discountValue: 0,
          percentValue: 0,
        });
      }
      const currentSalesByRepresentative =
        salesByRepresentative.get(representativeKey)!;
      currentSalesByRepresentative.salesCount += 1;
      currentSalesByRepresentative.totalKg += weightInKg;
      currentSalesByRepresentative.totalFatValue += invoicingValue;
      currentSalesByRepresentative.totalTableValue += tableValue;
      currentSalesByRepresentative.totalDiff += difValue;
      if (difValue > 0) {
        currentSalesByRepresentative.additionValue +=
          invoicingValue - tableValue;
      } else {
        currentSalesByRepresentative.discountValue +=
          tableValue - invoicingValue;
      }
    }

    console.log(`agg time ${new Date().getTime() - startTime}ms`);

    // Totals p/ agrupamento
    const invoiceTotals = this.getSalesAuditTotals(salesByInvoice);
    const productTotals = this.getSalesAuditTotals(salesByProduct);
    const clientTotals = this.getSalesAuditTotals(salesByClient);
    const representativeTotals = this.getSalesAuditTotals(
      salesByRepresentative,
    );

    console.log(`totals time ${new Date().getTime() - startTime}ms`);

    return new GetBusinessAuditSalesDataResponseDto({
      salesByInvoice: {
        totals: invoiceTotals,
        data: Object.fromEntries(salesByInvoice), // Map<string, InvoiceAgg>
      },
      salesByProduct: {
        totals: productTotals,
        data: Object.fromEntries(salesByProduct), // Map<string, ProductAgg>
      },
      salesByClient: {
        totals: clientTotals,
        data: Object.fromEntries(salesByClient), // Map<string, ClientAgg>
      },
      salesByRepresentative: {
        totals: representativeTotals,
        data: Object.fromEntries(salesByRepresentative), // Map<string, SalesRepresentativeAgg>
      },
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
    console.log('get raw many');
    console.log('result', result[0]);

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

  async getClients() {
    const qb = this.datasource
      .getRepository(OrderLine)
      .createQueryBuilder('so')
      .select(['so.clientCode', 'so.clientName'])
      .distinctOn(['so.clientCode']) // 👈 aqui
      .leftJoinAndSelect(
        'sensatta_companies',
        'sc',
        'sc.sensatta_code = so.companyCode',
      )
      .orderBy('so.clientCode', 'ASC')
      .addOrderBy('so.clientName', 'ASC');

    qb.where('1=1')
      .andWhere('so.situation = :situation', {
        situation: OrderSituationEnum.INVOICED,
      })
      .andWhere('so.cfop_code IN (:...cfops)', {
        cfops: CONSIDERED_CFOPS,
      });

    const result = await qb.getRawMany<{
      so_client_code: string;
      so_client_name: string;
    }>();

    return result.sort((a, b) =>
      a.so_client_name?.localeCompare(b.so_client_name, 'pt-br'),
    );
  }

  async getRepresentatives() {
    const qb = this.datasource
      .getRepository(OrderLine)
      .createQueryBuilder('so')
      .select(['so.salesRepresentativeCode', 'so.salesRepresentativeName'])
      .distinctOn(['so.salesRepresentativeCode']) // 👈 aqui
      .leftJoinAndSelect(
        'sensatta_companies',
        'sc',
        'sc.sensatta_code = so.companyCode',
      )
      // 👇 primeiro vem o campo do DISTINCT ON
      .orderBy('so.salesRepresentativeCode', 'ASC')
      // 👇 depois você pode ordenar os outros
      .addOrderBy('so.salesRepresentativeName', 'ASC');

    qb.where('1=1')
      .andWhere('so.situation = :situation', {
        situation: OrderSituationEnum.INVOICED,
      })
      .andWhere('so.cfop_code IN (:...cfops)', {
        cfops: CONSIDERED_CFOPS,
      });

    const result = await qb.getRawMany<{
      so_sales_representative_code: string;
      so_sales_representative_name: string;
    }>();

    return result.sort((a, b) =>
      a.so_sales_representative_name?.localeCompare(
        b.so_sales_representative_name,
        'pt-br',
      ),
    );
  }

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
        'si2_base.order_category AS "category_reinvoicing"',
        'si2_item.product_code AS "product_code_reinvoicing"',
        'si2_item.product_name AS "product_name_reinvoicing"',
        'si2_base.client_code AS "client_code_reinvoicing"',
        'si2_base.client_name AS "client_name_reinvoicing"',
        'si2_item.weight_in_kg AS "weight_in_kg_reinvoicing"',
        'si2_item.unit_price AS "unit_price_reinvoicing"',
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
      .andWhere('thr."NF_REFATURAMENTO" is not null ')
      .orderBy('si.date', 'ASC')
      .addOrderBy('si.nf_number', 'ASC')
      .addOrderBy('si2_base.nf_number', 'ASC')
      .addOrderBy('si.product_code', 'ASC');

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
    const response: GetReinvoicingHistoryItem[] = [];

    console.log(qb.getSql());
    console.log('history', history[0]);
    console.log('history length', history.length);

    // set => nf_number, weight_in_kg_dif
    const nfWeightMap = new Map<string, number>();

    history.forEach((row) => {
      const key = `${row.nf_number}-${row.product_code}`;
      if (!nfWeightMap.has(key)) nfWeightMap.set(key, 0);

      nfWeightMap.set(key, row.weight_in_kg);
    });

    console.log('nfWeightMap', nfWeightMap.get(`169-50392`));
    for (const row of history) {
      /////////////////////////////////////////////////////////////////////
      // Desconto de peso cumulativo
      const mapKey = `${row.nf_number}-${row.product_code}`;
      const map = nfWeightMap.get(mapKey);
      const difWeightInKgProportional = row.weight_in_kg_reinvoicing - map;

      nfWeightMap.set(mapKey, map - row.weight_in_kg_reinvoicing);

      /////////////////////////////////////////////////////////////////////
      const difWeightInKg = row.weight_in_kg_reinvoicing - row.weight_in_kg;
      const difSaleUnitPrice = row.unit_price_reinvoicing
        ? row.unit_price_reinvoicing - row.sale_unit_price
        : 0;

      const difDays = DateUtils.getDifferenceInDays(
        row.date,
        row.date_reinvoicing,
      );

      let difValue = 0;

      // Se a diferença em KG for igual a 0, é uma devolução Integral
      // Caso contrario é devolução parcial
      if (NumberUtils.nequal(difWeightInKg, 0)) {
        difValue = row.invoicing_value_reinvoicing - row.invoicing_value;
      } else {
        difValue = row.weight_in_kg_reinvoicing * difSaleUnitPrice;
      }

      const difValuePercent = row.invoicing_value_reinvoicing
        ? NumberUtils.nb4(row.invoicing_value_reinvoicing / row.invoicing_value)
        : 0;

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
        tableValue: row.table_value,

        reInvoicingDate: row.date_reinvoicing,
        reInvoicingNfNumber: row.nf_number_reinvoicing,
        reInvoicingCategory: row.category_reinvoicing,
        reInvoicingProductCode: row.product_code_reinvoicing,
        reInvoicingProductName: row.product_name_reinvoicing,
        reInvoicingClientCode: row.client_code_reinvoicing,
        reInvoicingClientName: row.client_name_reinvoicing,
        reInvoicingWeightInKg: row.weight_in_kg_reinvoicing,
        reInvoicingUnitPrice: row.unit_price_reinvoicing,
        reInvoicingValue: row.invoicing_value_reinvoicing,
        reInvoicingTableValue: row.table_value_reinvoicing,

        reInvoicingDif: difValue,
        difDays,
        difWeightInKg,
        difWeightInKgProportional,
        difSaleUnitPrice,
        difValue,
        difValuePercent,

        occurrenceNumber: row.occurrence_number,
        occurrenceCause: row.occurrence_cause,
        reinvoicingSequence: row.SEQUENCIA_REFATURAMENTO,
        returnType: row.return_type,
        observation: row.observation,

        aggDateReinvoicing: row.agg_date_reinvoicing,
        aggProductReinvoicing: row.agg_product_reinvoicing,
        aggWeightInKgReinvoicing: row.agg_weight_in_kg_reinvoicing,
      });
    }

    return response;
  }

  // aux
  private getSalesAuditTotals(
    map: Map<
      string,
      InvoiceAgg | ProductAgg | ClientAgg | SalesRepresentativeAgg
    >,
  ) {
    const arrayData = Array.from(map.values());

    // calculo de totals da capa
    const totals: GetBusinessAuditSalesDataTotals = arrayData.reduce(
      (acc, i) => {
        acc.count += i.salesCount;
        acc.totalKg += i.totalKg;
        acc.totalFatValue += i.totalFatValue;
        acc.totalTableValue += i.totalTableValue;
        acc.totalDiff += i.totalDiff;
        acc.totalAdditionValue += i.additionValue;
        acc.totalDiscountValue += i.discountValue;
        return acc;
      },
      {
        count: 0,
        totalKg: 0,
        totalFatValue: 0,
        totalTableValue: 0,
        totalDiff: 0,
        totalDiffPercent: 0,
        totalAdditionValue: 0,
        totalDiscountValue: 0,
      },
    );

    totals.totalDiffPercent =
      totals.totalTableValue === 0
        ? 0
        : NumberUtils.nb4(totals.totalDiff / totals.totalTableValue);

    // calculo de percentuais
    map.forEach((p) => {
      if (p.totalDiff > 0) {
        p.additionPercent = NumberUtils.nb4(
          p.totalFatValue / p.totalTableValue - 1,
        );
      } else {
        p.discountPercent = NumberUtils.nb4(
          1 - p.totalFatValue / p.totalTableValue,
        );
      }

      p.totalDiffPercent =
        p.totalTableValue === 0
          ? 0
          : NumberUtils.nb4(p.totalDiff / p.totalTableValue);

      p.percentValue = totals.totalFatValue
        ? p.totalFatValue / totals.totalFatValue
        : 0;
    });

    return totals;
  }
}
