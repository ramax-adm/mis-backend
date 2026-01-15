import { MarketEnum } from '@/modules/stock/enums/markets.enum';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { GetOrdersAnalyticalDataRequestDto } from '../dtos/request/orders-get-analytical-data-request.dto';
import { OrdersGetAnalyticalDataResponseDto } from '../dtos/response/orders-get-analytical-data-response.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly datasource: DataSource) {}

  async getOrderLines({
    companyCodes,
    startDate,
    endDate,
    orderId,
    situations,
  }: {
    companyCodes?: string[];
    startDate?: Date;
    endDate?: Date;
    orderId?: string;
    situations?: string[];
  }) {
    const qb = this.datasource
      .createQueryBuilder()
      .select(['so.*', 'sc.name AS company_name'])
      .from('sensatta_order_lines', 'so')
      .leftJoin(
        'sensatta_companies',
        'sc',
        'so.company_code = sc.sensatta_code',
      )
      .where('1=1');

    if (companyCodes) {
      qb.andWhere('so.company_code IN (:...companyCodes)', { companyCodes });
    }

    if (startDate) {
      qb.andWhere('so.issue_date >= :startDate', { startDate });
    }
    if (endDate) {
      qb.andWhere('so.issue_date <= :endDate', { endDate });
    }

    if (orderId) {
      qb.andWhere('so.order_id = :orderId', { orderId });
    }
    if (situations) {
      qb.andWhere('so.situation IN (:...situations)', { situations });
    }
    const results = await qb.getRawMany<{
      id: string;
      billing_date?: Date;
      issue_date?: Date;
      company_code?: string;
      company_name?: string;
      order_id?: string;
      market?: MarketEnum;
      situation?: string;
      payment_term_code?: string;
      payment_term?: string;
      client_code?: string;
      client_name?: string;
      sales_representative_code?: string;
      sales_representative_name?: string;
      category_code?: string;
      category?: string;
      order_operation?: string;
      product_line_code?: string;
      product_line_name?: string;
      product_code?: string;
      product_name?: string;
      quantity?: number;
      weight_in_kg?: number;
      currency?: string;
      cost_value?: number;
      discount_promotion_value?: number;
      sale_unit_value?: number;
      reference_table_unit_value?: number;
      total_value?: number;
      receivable_title_value?: number;
      reference_table_id?: string;
      reference_table_number?: string;
      reference_table_description?: string;
      freight_company_id?: string;
      freight_company_name?: string;
      description?: string;
      receivable_title_id?: string;
      receivable_title_number?: string;
      receivable_title_observation?: string;
      account_group_code?: string;
      account_group_name?: string;
      account_code?: string;
      account_name?: string;
      nf_id?: string;
      nf_number?: string;
      cfop_code?: string;
      cfop_description?: string;
      sale_region?: string;
      charge_specie_code?: string;
      charge_specie?: string;
      created_at?: Date;
    }>();

    return results.map((i) => ({
      id: i.id,
      billingDate: i.billing_date,
      issueDate: i.issue_date,
      companyCode: i.company_code,
      companyName: i.company_name,
      orderId: i.order_id,
      market: i.market,
      situation: i.situation,
      paymentTermCode: i.payment_term_code,
      paymentTerm: i.payment_term,
      clientCode: i.client_code,
      clientName: i.client_name,
      salesRepresentativeCode: i.sales_representative_code,
      salesRepresentativeName: i.sales_representative_name,
      categoryCode: i.category_code,
      category: i.category,
      orderOperation: i.order_operation,
      productLineCode: i.product_line_code,
      productLineName: i.product_line_name,
      productCode: i.product_code,
      productName: i.product_name,
      quantity: i.quantity,
      weightInKg: i.weight_in_kg,
      currency: i.currency,
      costValue: i.cost_value,
      discountPromotionValue: i.discount_promotion_value,
      saleUnitValue: i.sale_unit_value,
      referenceTableUnitValue: i.reference_table_unit_value,
      totalValue: i.total_value,
      receivableTitleValue: i.receivable_title_value,
      referenceTableId: i.reference_table_id,
      referenceTableNumber: i.reference_table_number,
      referenceTableDescription: i.reference_table_description,
      freightCompanyId: i.freight_company_id,
      freightCompanyName: i.freight_company_name,
      description: i.description,
      receivableTitleId: i.receivable_title_id,
      receivableTitleNumber: i.receivable_title_number,
      receivableTitleObservation: i.receivable_title_observation,
      accountGroupCode: i.account_group_code,
      accountGroupName: i.account_group_name,
      accountCode: i.account_code,
      accountName: i.account_name,
      nfId: i.nf_id,
      nfNumber: i.nf_number,
      cfopCode: i.cfop_code,
      cfopDescription: i.cfop_description,
      saleRegion: i.sale_region,
      chargeSpecieCode: i.charge_specie_code,
      chargeSpecie: i.charge_specie,
      createdAt: i.created_at,
    }));
  }

  async getAnalyticalData(requestDto: GetOrdersAnalyticalDataRequestDto) {
    const data = await this.getOrderLines(requestDto);
    // qtd de pedidos
    // qtd itens
    // preço total
    // preço total tabela
    // diferença preço tabela x preço real
    const totals = {
      count: 0,
      quantity: 0,
      weightInKg: 0,
      totalValue: 0,
      tableValue: 0,
      difValue: 0,
    };

    const orderMap = new Map<
      string,
      {
        billingDate: Date;
        issueDate: Date;
        companyCode: string;
        companyName: string;
        orderId: string;
        market: MarketEnum;
        situation: string;
        clientCode: string;
        clientName: string;
        salesRepresentativeCode: string;
        salesRepresentativeName: string;
        nfId: string;
        nfNumber: string;
        weightInKg: number;
        saleUnitValue: number;
        referenceTableUnitValue: number;
        totalValue: number;
        tableValue: number;
        difValue: number;
      }
    >();
    for (const item of data) {
      const key = item.orderId;
      if (!orderMap.has(key)) {
        orderMap.set(key, {
          billingDate: item.billingDate,
          issueDate: item.issueDate,
          companyCode: item.companyCode,
          companyName: item.companyName,
          orderId: item.orderId,
          market: item.market,
          situation: item.situation,
          clientCode: item.clientCode,
          clientName: item.clientName,
          salesRepresentativeCode: item.salesRepresentativeCode,
          salesRepresentativeName: item.salesRepresentativeName,
          nfId: item.nfId,
          nfNumber: item.nfNumber,
          weightInKg: 0,
          saleUnitValue: 0,
          referenceTableUnitValue: 0,
          totalValue: 0,
          tableValue: 0,
          difValue: 0,
        });
      }

      const order = orderMap.get(key)!;
      order.weightInKg += item.weightInKg || 0;
      order.saleUnitValue += item.saleUnitValue || 0;
      order.referenceTableUnitValue += item.referenceTableUnitValue || 0;
      order.totalValue += item.totalValue || 0;
      order.tableValue += item.referenceTableUnitValue * (item.weightInKg || 0);
      order.difValue = order.totalValue - order.tableValue;

      totals.quantity += 1;
      totals.weightInKg += item.weightInKg || 0;
      totals.totalValue += item.totalValue || 0;
      totals.tableValue +=
        item.referenceTableUnitValue * (item.weightInKg || 0);
    }

    totals.count = orderMap.size;
    totals.difValue = totals.totalValue - totals.tableValue;

    return new OrdersGetAnalyticalDataResponseDto({
      data: Object.fromEntries(orderMap),
      totals,
    });
  }
}
