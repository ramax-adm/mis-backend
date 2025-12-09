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

  async getReinvoicingHistory() {
    return await this.datasource
      .getRepository(TempHistoricoRefaturamento)
      .createQueryBuilder()
      .getMany();
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

    totals.totalDiffPercent = NumberUtils.nb4(
      totals.totalDiff / (totals.totalTableValue || 1),
    );

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

      p.totalDiffPercent = NumberUtils.nb4(
        p.totalDiff / (p.totalTableValue ?? 0),
      );

      p.percentValue = totals.totalFatValue
        ? p.totalFatValue / totals.totalFatValue
        : 0;
    });

    return totals;
  }
}
