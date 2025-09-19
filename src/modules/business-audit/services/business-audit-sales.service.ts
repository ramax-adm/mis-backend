import * as dateFns from 'date-fns';
import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { GetBusinessAuditOverviewDataResponseDto } from '../dtos/response/get-business-overview-data-response.dto';
import { NumberUtils } from '@/modules/utils/services/number.utils';
import { StringUtils } from '@/modules/utils/services/string.utils';
import { GetCattlePurchaseFreightsItem } from '../types/get-freights.type';
import { DateUtils } from '@/modules/utils/services/date.utils';
import { GetInvoicesItem } from '../types/get-invoices.type';
import { GetStockIncomingBatchesItem } from '../types/get-stock-incoming-batches.type';
import { InvoicesNfTypesEnum } from '@/modules/sales';
import { CONSIDERED_CFOPS } from '../constants/considered-cfops';
import { CONSIDERED_NF_SITUATIONS } from '../constants/considered-nf-situations';
import { OrderLine } from '@/modules/sales/entities/order-line.entity';
import {
  InvoiceAgg,
  ProductAgg,
  ClientAgg,
  SalesRepresentativeAgg,
} from '../types/get-sales-audit-data.type';
import { GetBusinessAuditSalesDataResponseDto } from '../dtos/response/get-business-sales-data-response.dto';
import { OrderSituationEnum } from '../enums/order-situation.enum';
import { OrderPriceConsiderationEnum } from '../enums/order-price-consideretion.enum';
import { MarketEnum } from '@/core/enums/sensatta/markets.enum';

@Injectable()
export class BusinessAuditSalesService {
  constructor(private readonly datasource: DataSource) {}

  // METODOS PRINCIPAIS
  async getSalesAuditData({
    startDate,
    endDate,
    priceConsideration,
    market,
    companyCodes,
    clientCode,
    salesRepresentativeCode,
  }: {
    startDate?: Date;
    endDate?: Date;
    priceConsideration?: OrderPriceConsiderationEnum;
    market?: MarketEnum;
    companyCodes?: string[];
    clientCode?: string;
    salesRepresentativeCode?: string;
  }) {
    const orderLines = await this.getOrdersLines({
      startDate,
      endDate,
      priceConsideration,
      market,
      companyCodes,
      clientCode,
      salesRepresentativeCode,
    });

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
          cfopCode: orderLine.cfopCode,
          cfopDescription: orderLine.cfopDescription,
          clientCode: orderLine.clientCode,
          clientName: orderLine.clientName,
          representativeCode: orderLine.salesRepresentativeCode,
          representativeName: orderLine.salesRepresentativeName,
          paymentTerm: orderLine.paymentTerm,
          market: orderLine.market,
          currency: orderLine.currency,
          salesCount: 0,
          totalFatValue: 0,
          totalTableValue: 0,
          totalDiff: 0,
          totalKg: 0,
        });
      }
      const currentSalesByInvoice = salesByInvoice.get(invoiceKey)!;
      currentSalesByInvoice.salesCount += 1;
      currentSalesByInvoice.totalFatValue += invoicingValue;
      currentSalesByInvoice.totalTableValue += tableValue;
      currentSalesByInvoice.totalDiff += difValue;
      currentSalesByInvoice.totalKg += weightInKg;

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
          percentValue: 0,
        });
      }
      const currentSalesByProduct = salesByProduct.get(productKey)!;
      currentSalesByProduct.salesCount += 1;
      currentSalesByProduct.totalKg += weightInKg;
      currentSalesByProduct.totalFatValue += invoicingValue;
      currentSalesByProduct.totalTableValue += tableValue;
      currentSalesByProduct.totalDiff += difValue;

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
          percentValue: 0,
        });
      }
      const currentSalesByClient = salesByClient.get(clientKey)!;
      currentSalesByClient.salesCount += 1;
      currentSalesByClient.totalKg += weightInKg;
      currentSalesByClient.totalFatValue += invoicingValue;
      currentSalesByClient.totalTableValue += tableValue;
      currentSalesByClient.totalDiff += difValue;

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
    }

    // calcular totais globais de cada agrupamento
    const invoiceTotals = Array.from(salesByInvoice.values()).reduce(
      (tot, i) => {
        tot.count += i.salesCount;
        tot.totalFatValue += i.totalFatValue;
        tot.totalTableValue += i.totalTableValue;
        tot.totalDiff += i.totalDiff;
        return tot;
      },
      { count: 0, totalFatValue: 0, totalTableValue: 0, totalDiff: 0 },
    );

    const productTotals = Array.from(salesByProduct.values()).reduce(
      (tot, i) => {
        tot.count += i.salesCount;
        tot.totalFatValue += i.totalFatValue;
        tot.totalTableValue += i.totalTableValue;
        tot.totalDiff += i.totalDiff;
        return tot;
      },
      { count: 0, totalFatValue: 0, totalTableValue: 0, totalDiff: 0 },
    );

    salesByProduct.forEach((p) => {
      p.percentValue = productTotals.totalFatValue
        ? p.totalFatValue / productTotals.totalFatValue
        : 0;
    });

    const clientTotals = Array.from(salesByClient.values()).reduce(
      (acc, i) => {
        acc.count += i.salesCount;
        acc.totalFatValue += i.totalFatValue;
        acc.totalTableValue += i.totalTableValue;
        acc.totalDiff += i.totalDiff;
        return acc;
      },
      { count: 0, totalFatValue: 0, totalTableValue: 0, totalDiff: 0 },
    );

    salesByClient.forEach((p) => {
      p.percentValue = clientTotals.totalFatValue
        ? p.totalFatValue / clientTotals.totalFatValue
        : 0;
    });

    const representativeTotals = Array.from(
      salesByRepresentative.values(),
    ).reduce(
      (tot, i) => {
        tot.count += i.salesCount;
        tot.totalFatValue += i.totalFatValue;
        tot.totalTableValue += i.totalTableValue;
        tot.totalDiff += i.totalDiff;
        return tot;
      },
      { count: 0, totalFatValue: 0, totalTableValue: 0, totalDiff: 0 },
    );
    salesByRepresentative.forEach((p) => {
      p.percentValue = representativeTotals.totalFatValue
        ? p.totalFatValue / representativeTotals.totalFatValue
        : 0;
    });

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
    clientCode,
    salesRepresentativeCode,
    priceConsideration,
    nfNumber,
    nfId,
    market,
    companyCodes,
  }: {
    startDate?: Date;
    endDate?: Date;
    productCode?: string;
    clientCode?: string;
    priceConsideration?: OrderPriceConsiderationEnum;
    salesRepresentativeCode?: string;
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
    if (clientCode) {
      qb.andWhere('so.clientCode = :clientCode', { clientCode });
    }
    if (salesRepresentativeCode) {
      qb.andWhere('so.salesRepresentativeCode = :salesRepresentativeCode', {
        salesRepresentativeCode,
      });
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

    return result.map((i) => {
      const orderLine = new OrderLine();

      // todos os campos do alias `so`
      orderLine.id = i.so_id;
      orderLine.billingDate = i.so_billing_date;
      orderLine.issueDate = i.so_issue_date;
      orderLine.companyCode = i.so_company_code;
      orderLine.companyName = i.sc_name; // <-- pega de sc.name
      orderLine.orderId = i.so_order_id;
      orderLine.situation = i.so_situation;
      orderLine.market = i.so_market;
      orderLine.paymentTerm = i.so_payment_term;
      orderLine.clientCode = i.so_client_code;
      orderLine.clientName = i.so_client_name;
      orderLine.salesRepresentativeCode = i.so_sales_representative_code;
      orderLine.salesRepresentativeName = i.so_sales_representative_name;
      orderLine.category = i.so_category;
      orderLine.productLineCode = i.so_product_line_code;
      orderLine.productLineName = i.so_product_line_name;
      orderLine.productCode = i.so_product_code;
      orderLine.productName = i.so_product_name;
      orderLine.quantity = i.so_quantity;
      orderLine.weightInKg = i.so_weight_in_kg;
      orderLine.currency = i.so_currency;
      orderLine.costValue = i.so_cost_value;
      orderLine.discountPromotionValue = i.so_discount_promotion_value;
      orderLine.saleUnitValue = i.so_sale_unit_value;
      orderLine.referenceTableUnitValue = i.so_reference_table_unit_value;
      orderLine.totalValue = i.so_total_value;
      orderLine.receivableTitleValue = i.so_receivable_title_value;
      orderLine.referenceTableId = i.so_reference_table_id;
      orderLine.referenceTableDescription = i.so_reference_table_description;
      orderLine.freightCompanyId = i.so_freight_company_id;
      orderLine.freightCompanyName = i.so_freight_company_name;
      orderLine.description = i.so_description;
      orderLine.receivableTitleId = i.so_receivable_title_id;
      orderLine.receivableTitleNumber = i.so_receivable_title_number;
      orderLine.receivableTitleObservation = i.so_receivable_title_observation;
      orderLine.accountGroupCode = i.so_account_group_code;
      orderLine.accountGroupName = i.so_account_group_name;
      orderLine.accountCode = i.so_account_code;
      orderLine.accountName = i.so_account_name;
      orderLine.nfId = i.so_nf_id;
      orderLine.nfNumber = i.so_nf_number;
      orderLine.cfopCode = i.so_cfop_code;
      orderLine.cfopDescription = i.so_cfop_description;
      orderLine.createdAt = i.so_created_at;

      return orderLine;
    });
  }

  async getClients({
    startDate,
    endDate,
    productCode,
    clientCode,
    salesRepresentativeCode,
    priceConsideration,
    nfNumber,
    nfId,
    market,
    companyCodes,
  }: {
    startDate?: Date;
    endDate?: Date;
    productCode?: string;
    clientCode?: string;
    priceConsideration?: OrderPriceConsiderationEnum;
    salesRepresentativeCode?: string;
    nfNumber?: string;
    nfId?: string;
    market?: MarketEnum;
    companyCodes?: string[];
  }) {
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

    if (startDate) {
      qb.andWhere('so.billing_date >= :startDate', { startDate });
    }
    if (endDate) {
      qb.andWhere('so.billing_date <= :endDate', { endDate });
    }
    if (productCode) {
      qb.andWhere('so.productCode = :productCode', { productCode });
    }
    if (clientCode) {
      qb.andWhere('so.clientCode = :clientCode', { clientCode });
    }
    if (salesRepresentativeCode) {
      qb.andWhere('so.salesRepresentativeCode = :salesRepresentativeCode', {
        salesRepresentativeCode,
      });
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

    const result = await qb.getRawMany<{
      so_client_code: string;
      so_client_name: string;
    }>();

    return result.sort((a, b) =>
      a.so_client_name.localeCompare(b.so_client_name, 'pt-br'),
    );
  }

  async getRepresentatives({
    startDate,
    endDate,
    productCode,
    clientCode,
    salesRepresentativeCode,
    priceConsideration,
    nfNumber,
    nfId,
    market,
    companyCodes,
  }: {
    startDate?: Date;
    endDate?: Date;
    productCode?: string;
    clientCode?: string;
    priceConsideration?: OrderPriceConsiderationEnum;
    salesRepresentativeCode?: string;
    nfNumber?: string;
    nfId?: string;
    market?: MarketEnum;
    companyCodes?: string[];
  }) {
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

    if (startDate) {
      qb.andWhere('so.billing_date >= :startDate', { startDate });
    }
    if (endDate) {
      qb.andWhere('so.billing_date <= :endDate', { endDate });
    }
    if (productCode) {
      qb.andWhere('so.productCode = :productCode', { productCode });
    }
    if (clientCode) {
      qb.andWhere('so.clientCode = :clientCode', { clientCode });
    }
    if (salesRepresentativeCode) {
      qb.andWhere('so.salesRepresentativeCode = :salesRepresentativeCode', {
        salesRepresentativeCode,
      });
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

    const result = await qb.getRawMany<{
      so_sales_representative_code: string;
      so_sales_representative_name: string;
    }>();

    return result.sort((a, b) =>
      a.so_sales_representative_name.localeCompare(
        b.so_sales_representative_name,
        'pt-br',
      ),
    );
  }
}
