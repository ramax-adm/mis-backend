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
export class BusinessAuditService {
  constructor(private readonly datasource: DataSource) {}

  // METODOS PRINCIPAIS
  async getOverviewData({
    startDate,
    endDate,
  }: {
    startDate?: Date;
    endDate?: Date;
  }) {
    // faturamento
    const [invoices, manuallyEnteredInvoices] = await Promise.all([
      this.getInvoices({
        startDate,
        endDate,
      }),
      this.getInvoices({
        startDate,
        endDate,
        nfType: InvoicesNfTypesEnum.AVULSA,
      }),
    ]);

    const invoicesWithSamePrice = this.getInvoicesWithSamePrice(invoices);
    const invoicesWithSamePriceTotals = invoicesWithSamePrice.reduce(
      (acc, item) => ({
        quantity: acc.quantity + 1,
        totalPrice: acc.totalPrice + item.totalPrice,
      }),
      { quantity: 0, totalPrice: 0 },
    );

    const manuallyEnteredInvoicesByCompanyMap =
      this.getManuallyEnteredInvoicesByKey(
        'companyName',
        manuallyEnteredInvoices,
      );
    const manuallyEnteredInvoicesByClientMap =
      this.getManuallyEnteredInvoicesByKey(
        'clientName',
        manuallyEnteredInvoices,
      );

    const manuallyEnteredInvoicesTotals = manuallyEnteredInvoices.reduce(
      (acc, item) => ({
        quantity: 0,
        productQuantity: 0,
        weightInKg: acc.weightInKg + item.weightInKg,
        totalPrice: acc.totalPrice + item.totalPrice,
      }),
      {
        quantity: 0,
        productQuantity: 0,
        weightInKg: 0,
        totalPrice: 0,
      },
    );

    const manuallyInvoicesByNfNumberSet = new Set();
    manuallyEnteredInvoices.forEach((i) =>
      manuallyInvoicesByNfNumberSet.add(i.nfNumber),
    );
    manuallyEnteredInvoicesTotals.quantity = manuallyInvoicesByNfNumberSet.size;
    manuallyEnteredInvoicesTotals.productQuantity =
      manuallyEnteredInvoices.length;

    // Fretes Compra
    const cattlePurchaseFreights = await this.getFreights({
      startDate,
      endDate,
    });
    const openCattlePurchaseFreights = this.getOpenCattlePurchaseFreights(
      cattlePurchaseFreights,
    );
    const openCattlePurchaseFreightsTotals = {
      quantity: openCattlePurchaseFreights.length,
    };

    const cattlePurchaseFreightsDuplicated =
      this.getDuplicatedFreightsByDateAndPlate(cattlePurchaseFreights);
    const cattlePurchaseFreightsOverTablePrice: {
      date: Date;
      companyCode: string;
      purchaseCattleOrderId: string;
      referenceFreightTablePrice: number;
      negotiatedFreightPrice: number;
    }[] = [];

    const cattlePurchaseFreightsDuplicatedTotals = {
      quantity: cattlePurchaseFreightsDuplicated.length,
    };

    const cattlePurchaseFreightsOverTablePriceTotals = {
      quantity: 0,
      referenceFreightTablePrice: 0,
      negotiatedFreightPrice: 0,
    };

    for (const freight of cattlePurchaseFreights) {
      const { referenceFreightTablePrice, negotiatedFreightPrice } = freight;
      const tenPercentInNumber = 0.1;
      const isFreightOverTenPercertOfReferenceTable =
        NumberUtils.nb2(negotiatedFreightPrice / referenceFreightTablePrice) >
        1 + tenPercentInNumber;

      if (
        isFreightOverTenPercertOfReferenceTable &&
        freight.negotiatedFreightPrice > 1
      ) {
        cattlePurchaseFreightsOverTablePrice.push({
          date: freight.slaughterDate,
          companyCode: freight.companyCode,
          negotiatedFreightPrice,
          purchaseCattleOrderId: freight.purchaseCattleOrderId,
          referenceFreightTablePrice,
        });
        cattlePurchaseFreightsOverTablePriceTotals.quantity += 1;
        cattlePurchaseFreightsOverTablePriceTotals.referenceFreightTablePrice +=
          referenceFreightTablePrice;
        cattlePurchaseFreightsOverTablePriceTotals.negotiatedFreightPrice +=
          negotiatedFreightPrice;
      }
    }

    // Estoque
    const stockIncomingBatches = await this.getStockIncomingBatches();

    const toExpiresStockMap = new Map<
      string,
      {
        dueDate: Date;
        companyCode: string;
        productCode: string;
        productName: string;
        totalWeightInKg: number;
        daysToExpires: number;
      }
    >();

    const toExpiresStockTotals = {
      totalWeightInKg: 0,
      daysToExpires: 0, // média final, calculada ao final

      totalExpiredStockWeightInKg: 0, // estoque vencido
      totalFifoExpiresStockWeightInKg: 0, // estoque de 0-15 dias, vira fifo
      totalAlertExpiresStockWeightInKg: 0, // estoque de 15 a 30 dias
    };

    let daysToExpiresSum = 0;
    for (const batch of stockIncomingBatches) {
      if (!batch.productCode) {
        continue;
      }

      const currentDaysToExpires = dateFns.differenceInDays(
        batch.dueDate,
        new Date(),
      );

      if (currentDaysToExpires > 30) {
        continue;
      }

      const key = batch.productCode
        .concat('@')
        .concat(DateUtils.format(batch.dueDate, 'international-date'));

      const previous = toExpiresStockMap.get(key);

      const data = {
        dueDate: batch.dueDate,
        productCode: batch.productCode,
        companyCode: batch.companyCode,
        productName: batch.productName,
        totalWeightInKg: batch.weightInKg,
        daysToExpires: currentDaysToExpires,
      };

      if (previous) {
        data.totalWeightInKg += previous.totalWeightInKg;
      }

      toExpiresStockMap.set(key, data);
    }

    // calculo dos totais
    for (const batch of stockIncomingBatches) {
      const currentDaysToExpires = dateFns.differenceInDays(
        batch.dueDate,
        new Date(),
      );
      if (currentDaysToExpires > 30) {
        continue;
      }

      toExpiresStockTotals.totalWeightInKg += batch.weightInKg;
      if (currentDaysToExpires < 0) {
        toExpiresStockTotals.totalExpiredStockWeightInKg += batch.weightInKg;
      } else if (currentDaysToExpires >= 0 && currentDaysToExpires <= 15) {
        toExpiresStockTotals.totalFifoExpiresStockWeightInKg +=
          batch.weightInKg;
      } else {
        toExpiresStockTotals.totalAlertExpiresStockWeightInKg +=
          batch.weightInKg;
      }
    }

    if (toExpiresStockTotals.totalWeightInKg > 0) {
      toExpiresStockTotals.daysToExpires =
        daysToExpiresSum / stockIncomingBatches.length;
    }

    // Totais
    return new GetBusinessAuditOverviewDataResponseDto({
      invoicesWithSamePrice,
      invoicesWithSamePriceTotals,

      manuallyEnteredInvoicesByCompany: Object.fromEntries(
        manuallyEnteredInvoicesByCompanyMap,
      ),
      manuallyEnteredInvoicesByClient: Object.fromEntries(
        manuallyEnteredInvoicesByClientMap,
      ),
      manuallyEnteredInvoicesTotals,

      openCattlePurchaseFreightsTotals,
      openCattlePurchaseFreights,
      cattlePurchaseFreightsDuplicated,
      cattlePurchaseFreightsDuplicatedTotals,
      cattlePurchaseFreightsOverTablePrice,
      cattlePurchaseFreightsOverTablePriceTotals,

      toExpiresStock: Object.fromEntries(toExpiresStockMap),
      toExpiresStockTotals,
    });
  }

  async getSalesAuditData({
    startDate,
    endDate,
    priceConsideration,
    market,
    companyCodes,
  }: {
    startDate?: Date;
    endDate?: Date;
    priceConsideration?: OrderPriceConsiderationEnum;
    market?: MarketEnum;
    companyCodes?: string[];
  }) {
    const orderLinesInDatabase = await this.getOrdersLines({
      startDate,
      endDate,
      priceConsideration,
      market,
      companyCodes,
    });

    const orderLines = orderLinesInDatabase.filter((o) =>
      CONSIDERED_CFOPS.includes(o.cfopCode),
    );

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
      const curSalesByInvoice = salesByInvoice.get(invoiceKey)!;
      curSalesByInvoice.salesCount += 1;
      curSalesByInvoice.totalFatValue += invoicingValue;
      curSalesByInvoice.totalTableValue += tableValue;
      curSalesByInvoice.totalDiff += difValue;
      curSalesByInvoice.totalKg += weightInKg;

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
      const curSalesByProduct = salesByProduct.get(productKey)!;
      curSalesByProduct.salesCount += 1;
      curSalesByProduct.totalKg += weightInKg;
      curSalesByProduct.totalFatValue += invoicingValue;
      curSalesByProduct.totalTableValue += tableValue;
      curSalesByProduct.totalDiff += difValue;

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
      const curSalesByClient = salesByClient.get(clientKey)!;
      curSalesByClient.salesCount += 1;
      curSalesByClient.totalKg += weightInKg;
      curSalesByClient.totalFatValue += invoicingValue;
      curSalesByClient.totalTableValue += tableValue;
      curSalesByClient.totalDiff += difValue;

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
      const curSalesByRepresentative =
        salesByRepresentative.get(representativeKey)!;
      curSalesByRepresentative.salesCount += 1;
      curSalesByRepresentative.totalKg += weightInKg;
      curSalesByRepresentative.totalFatValue += invoicingValue;
      curSalesByRepresentative.totalTableValue += tableValue;
      curSalesByRepresentative.totalDiff += difValue;
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

    qb.where('1=1').andWhere('so.situation = :situation', {
      situation: OrderSituationEnum.INVOICED,
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

  private async getInvoices({
    startDate,
    endDate,
    nfType,
  }: {
    startDate?: Date;
    endDate?: Date;
    nfType?: InvoicesNfTypesEnum;
  }): Promise<GetInvoicesItem[]> {
    const qb = this.datasource
      .createQueryBuilder()
      .select([
        'si."date"',
        'si.nf_type',
        'si.company_code',
        'sc.name AS company_name',
        'si.cfop_code',
        'si.cfop_description',
        'si.nf_number',
        'si.order_id',
        'si.client_code',
        'si.client_name',
        'si.product_code',
        'si.product_name',
        'si.box_amount',
        'si.weight_in_kg',
        'si.unit_price',
        'si.total_price',
      ])
      .from('sensatta_invoices', 'si')
      .leftJoin(
        'sensatta_companies',
        'sc',
        'sc.sensatta_code = si.company_code',
      )
      .where('1=1')
      .andWhere('si.nf_situation IN (:...NF_SITUATIONS)', {
        NF_SITUATIONS: CONSIDERED_NF_SITUATIONS,
      })
      .andWhere('si.cfop_code IN (:...CFOPS)', { CFOPS: CONSIDERED_CFOPS });

    if (nfType) {
      qb.andWhere('si.nf_type = :nfType', { nfType });
    }
    if (startDate) {
      qb.andWhere('si.date >= :startDate', { startDate });
    }

    if (endDate) {
      qb.andWhere('si.date <= :endDate', { endDate });
    }

    const results = await qb.getRawMany();

    return results.map((i) => ({
      date: i.date,
      nfType: i.nf_type,
      companyCode: i.company_code,
      companyName: i.company_name,
      cfopCode: i.cfop_code,
      cfopDescription: i.cfop_description,
      nfNumber: i.nf_number,
      orderId: i.order_id,
      clientCode: i.client_code,
      clientName: i.client_name,
      productCode: i.product_code,
      productName: i.product_name,
      boxAmount: i.box_amount,
      weightInKg: i.weight_in_kg,
      unitPrice: i.unit_price,
      totalPrice: i.total_price,
    }));
  }

  private async getFreights({
    startDate,
    endDate,
  }: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<GetCattlePurchaseFreightsItem[]> {
    const qb = this.datasource
      .createQueryBuilder()
      .select([
        'scpf."slaughter_date"',
        'scpf.freight_closing_date',
        'scpf.purchase_cattle_order_id',
        'scpf.company_code',
        'sc."name"',
        'scpf.freight_company_code',
        'scpf.freight_company_name',
        'scpf.supplier_code',
        'scpf.supplier_name',
        'scpf.cattle_advisor_code',
        'scpf.cattle_advisor_name',
        'scpf.feedlot_id',
        'scpf.feedlot_name',
        'scpf.feedlot_km_distance',
        'scpf.negotiated_km_distance',
        'scpf.cattle_quantity',
        'scpf.reference_freight_table_price',
        'scpf.negotiated_freight_price',
        'scpf.freight_transport_plate',
        'scpf.freight_transport_type',
      ])
      .addSelect('sc."name"', 'company_name')
      .from('sensatta_cattle_purchase_freights', 'scpf')
      .leftJoin(
        'sensatta_companies',
        'sc',
        'sc.sensatta_code = scpf.company_code',
      );

    if (startDate) {
      qb.andWhere('scpf."slaughter_date" >= :startDate', { startDate });
    }

    if (endDate) {
      qb.andWhere('scpf."slaughter_date" <= :endDate', { endDate });
    }

    const results = await qb.getRawMany();

    return results.map((i) => ({
      slaughterDate: i.slaughter_date,
      freightClosingDate: i.freight_closing_date,
      purchaseCattleOrderId: i.purchase_cattle_order_id,
      companyCode: i.company_code,
      companyName: i.name,
      freightCompanyCode: i.freight_company_code,
      freightCompanyName: i.freight_company_name,
      supplierCode: i.supplier_code,
      supplierName: i.supplier_name,
      cattleAdvisorCode: i.cattle_advisor_code,
      cattleAdvisorName: i.cattle_advisor_name,
      feedlotId: i.feedlot_id,
      feedlotName: i.feedlot_name,
      feedlotKmDistance: i.feedlot_km_distance,
      negotiatedKmDistance: i.negotiated_km_distance,
      cattleQuantity: i.cattle_quantity,
      referenceFreightTablePrice: i.reference_freight_table_price,
      negotiatedFreightPrice: i.negotiated_freight_price,
      freightTransportPlate: i.freight_transport_plate,
      freightTransportType: i.freight_transport_type,
    }));
  }

  private async getStockIncomingBatches(): Promise<
    GetStockIncomingBatchesItem[]
  > {
    const qb = this.datasource
      .createQueryBuilder()
      .select([
        'sc.sensatta_code AS "companyCode"',
        'sib.production_date AS "productionDate"',
        'sib.due_date AS "dueDate"',
        'sp.sensatta_code AS "productCode"',
        'sp.name AS "productName"',
        'sib.weight_in_kg AS "weightInKg"',
      ])
      .from('sensatta_warehouses', 'sw')
      .leftJoin(
        'sensatta_companies',
        'sc',
        'sc.sensatta_code = sw.company_code',
      )
      .leftJoin(
        'sensatta_incoming_batches',
        'sib',
        'sib.warehouse_code = sw.sensatta_code',
      )
      .leftJoin(
        'sensatta_products',
        'sp',
        'sp.sensatta_code = sib.product_code',
      )
      .leftJoin(
        'sensatta_product_lines',
        'spl',
        'spl.sensatta_code = sib.product_line_code',
      )
      .where('sw.is_considered_on_stock = true');

    const results = await qb.getRawMany();

    return results.map((i) => ({
      companyCode: i.companyCode,
      productionDate: i.productionDate,
      dueDate: i.dueDate,
      productCode: i.productCode,
      productName: i.productName,
      weightInKg: i.weightInKg,
    }));
  }

  // METODOS AUXILIARES
  private getManuallyEnteredInvoicesByKey(
    key: keyof GetInvoicesItem,
    invoices: GetInvoicesItem[],
  ): Map<
    string,
    {
      companyCode: string;
      companyName: string;
      quantity: number;
      productQuantity: number;
      weightInKg: number;
      totalPrice: number;
    }
  > {
    const data: Record<
      string,
      {
        companyCode: string;
        companyName: string;
        quantity: number;
        productQuantity: number;
        weightInKg: number;
        totalPrice: number;
      }
    > = {};

    const map = new Map<string, Set<string>>();

    for (const invoice of invoices) {
      const entityKey = invoice[key] as string;
      const nfNumber = invoice.nfNumber;

      if (!data[entityKey]) {
        data[entityKey] = {
          companyCode: invoice.companyCode,
          companyName: invoice.companyName,
          quantity: 0,
          productQuantity: 0,
          weightInKg: 0,
          totalPrice: 0,
        };
      }

      data[entityKey].productQuantity += 1;
      data[entityKey].weightInKg += invoice.weightInKg;
      data[entityKey].totalPrice += invoice.totalPrice;

      if (!map.has(entityKey)) {
        map.set(entityKey, new Set());
      }
      map.get(entityKey)!.add(nfNumber);
    }

    // Atualiza as quantidades únicas de NFs
    for (const [entityKey, nfSet] of map.entries()) {
      data[entityKey].quantity = nfSet.size;
    }

    // Converte para Map antes de retornar
    const result = new Map<string, (typeof data)[string]>();
    for (const [key, value] of Object.entries(data)) {
      result.set(key, value);
    }

    return result;
  }

  // todo:
  private getInvoicesWithSamePrice(invoices: GetInvoicesItem[]) {
    // tenho que receber as nfs agrupadas por n°
    const groupedInvoicesMap = new Map<string, GetInvoicesItem>();
    for (const invoice of invoices) {
      const key = invoice.nfNumber;
      if (!groupedInvoicesMap.has(key)) {
        groupedInvoicesMap.set(key, {
          ...invoice,
          boxAmount: 0,
          weightInKg: 0,
          totalPrice: 0,
        });
      }
      const group = groupedInvoicesMap.get(key)!;
      group.boxAmount += invoice.boxAmount;
      group.weightInKg = NumberUtils.nb2(group.weightInKg + invoice.weightInKg);
      group.totalPrice = NumberUtils.nb2(group.totalPrice + invoice.totalPrice);
    }

    const groupedInvoices = Array.from(groupedInvoicesMap.values());

    // faço o agrupamento das nfs com o valor e data iguais
    const groupedInvoicesByDateAndPriceMap = new Map<
      string,
      GetInvoicesItem[]
    >();
    for (const invoice of groupedInvoices) {
      const dateKey = invoice.date.toISOString().split('T')[0];
      const priceKey = invoice.totalPrice;

      const key = `${dateKey}|${priceKey}`;

      if (!groupedInvoicesByDateAndPriceMap.has(key)) {
        groupedInvoicesByDateAndPriceMap.set(key, []);
      }

      groupedInvoicesByDateAndPriceMap.get(key)!.push(invoice);
    }

    // depois de ver as nfs agrupadas, vejo quais datas tem mais de 1 registro
    const duplicatedInvoices: GetInvoicesItem[] = [];

    for (const group of groupedInvoicesByDateAndPriceMap.values()) {
      if (group.length > 1) {
        duplicatedInvoices.push(...group);
      }
    }

    return duplicatedInvoices.map((i) => ({
      date: i.date,
      nfNumber: i.nfNumber,
      companyCode: i.companyCode,
      companyName: i.companyName,
      clientCode: i.clientCode,
      clientName: i.clientName,
      totalPrice: i.totalPrice,
    }));
  }

  private getDuplicatedFreightsByDateAndPlate(
    freights: GetCattlePurchaseFreightsItem[],
  ) {
    const grouped = new Map<string, GetCattlePurchaseFreightsItem[]>();

    for (const freight of freights) {
      // Garantimos que tenha data e placa válida
      if (!freight.slaughterDate || !freight.freightTransportPlate?.trim()) {
        continue;
      }

      const dateKey = freight.slaughterDate.toISOString().split('T')[0];
      const plateKey = freight.freightTransportPlate.trim().toUpperCase();
      const key = `${dateKey}|${plateKey}`;

      if (!grouped.has(key)) {
        grouped.set(key, []);
      }

      grouped.get(key)!.push(freight);
    }

    const duplicatedFreights: GetCattlePurchaseFreightsItem[] = [];

    for (const group of grouped.values()) {
      if (group.length > 1) {
        duplicatedFreights.push(...group);
      }
    }

    return duplicatedFreights.map((i) => ({
      date: i.slaughterDate,
      companyCode: i.companyCode,
      purchaseCattleOrderId: i.purchaseCattleOrderId,
      freightTransportPlate: i.freightTransportPlate,
      cattleQuantity: i.cattleQuantity,
    }));
  }

  private getOpenCattlePurchaseFreights(
    freights: GetCattlePurchaseFreightsItem[],
  ) {
    return freights
      .filter((i) => i.freightClosingDate === null)
      .filter((i) => !StringUtils.ILike(i.freightTransportType, '%SEM FRETE%'));
  }
}
