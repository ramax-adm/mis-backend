import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InvoicesNfTypesEnum } from '../enums/invoices-nf-types.enum';
import { InvoicesSituationsEnum } from '../enums/invoices-situations.enum';
import { GetInvoicesItem } from '../types/get-invoices.type';
import { NumberUtils } from '@/modules/utils/services/number.utils';

@Injectable()
export class SalesInvoicesService {
  constructor(private readonly datasource: DataSource) {}

  getResumedData() {}

  /**
   * 
        and si.company_code  = :companyCode
        and si.client_code = :clientCode
        and si.cfop_code = :cfopCode
   *    and si.nf_type = :nfType
        and si.nf_number ilike '%' || :nfNumber || '%'
        and si.nf_situation = :nfSituation
   */
  async getAnalyticalData({
    companyCode,
    startDate,
    endDate,
    clientCode,
    cfopCodes,
    nfType,
    nfNumber,
    nfSituations,
  }: {
    companyCode: string;
    startDate: Date;
    endDate: Date;
    clientCode: string;
    cfopCodes: string[];
    nfType: InvoicesNfTypesEnum;
    nfNumber: string;
    nfSituations: InvoicesSituationsEnum[];
  }) {
    const data = await this.getInvoices({
      companyCode,
      startDate,
      endDate,
      clientCode,
      cfopCodes,
      nfType,
      nfNumber,
      nfSituations,
    });

    // nf quantity
    const nfSet = new Set();
    data.forEach((i) => nfSet.add(i.nfNumber));

    const totals = data.reduce(
      (acc, item) => ({
        quantity: acc.quantity,
        productQuantity: acc.productQuantity + 1,
        boxAmount: NumberUtils.nb2(acc.boxAmount + item.boxAmount),
        weightInKg: NumberUtils.nb2(acc.weightInKg + item.weightInKg),
        unitPrice: NumberUtils.nb2(acc.unitPrice + item.unitPrice),
        totalPrice: NumberUtils.nb2(acc.totalPrice + item.totalPrice),
      }),
      {
        quantity: nfSet.size,
        productQuantity: 0,
        boxAmount: 0,
        weightInKg: 0,
        unitPrice: 0,
        totalPrice: 0,
      },
    );

    return { totals, data };
  }

  private async getInvoices({
    companyCode,
    startDate,
    endDate,
    clientCode,
    cfopCodes,
    nfType,
    nfNumber,
    nfSituations,
  }: {
    companyCode: string;
    startDate?: Date;
    endDate?: Date;
    clientCode?: string;
    cfopCodes?: string[];
    nfType?: InvoicesNfTypesEnum;
    nfNumber?: string;
    nfSituations?: InvoicesSituationsEnum[];
  }): Promise<GetInvoicesItem[]> {
    const qb = this.datasource
      .createQueryBuilder()
      .select(['si.*', 'sc.name AS company_name'])
      .from('sensatta_invoices', 'si')
      .leftJoin(
        'sensatta_companies',
        'sc',
        'si.company_code = sc.sensatta_code',
      )
      .where('1=1')
      .andWhere('si.company_code = :companyCode', { companyCode });

    if (nfType) {
      qb.andWhere('si.nf_type = :nfType', { nfType });
    }

    if (nfNumber) {
      qb.andWhere('si.nf_number ILIKE :nfNumber', {
        nfNumber: `%${nfNumber}%`,
      });
    }

    if (cfopCodes) {
      qb.andWhere('si.cfop_code IN (:...cfopCodes)', { cfopCodes });
    }

    if (clientCode) {
      qb.andWhere('si.client_code = :clientCode', { clientCode });
    }

    if (nfSituations) {
      qb.andWhere('si.nf_situation IN (:...nfSituations)', { nfSituations });
    }

    if (startDate) {
      qb.andWhere('si.date >= :startDate', { startDate });
    }

    if (endDate) {
      qb.andWhere('si.date <= :endDate', { endDate });
    }

    const results = await qb.getRawMany<{
      id: string;
      date?: Date;
      nf_type?: string;
      client_type_code?: string | null;
      client_type_name?: string | null;
      company_code?: string;
      company_name: string;
      cfop_code?: string;
      cfop_description?: string;
      nf_number?: string;
      request_id?: string;
      client_code?: string;
      client_name?: string;
      product_code?: string;
      product_name?: string;
      box_amount?: number;
      weight_in_kg?: number;
      unit_price?: number;
      total_price?: number;
      created_at?: Date; // ou `Date` se for convertido
      nf_situation: string;
    }>();

    return results.map((i) => ({
      id: i.id,
      date: i.date,
      nfSituation: i.nf_situation,
      nfType: i.nf_type,
      clientTypeCode: i.client_type_code,
      clientTypeName: i.client_type_name,
      companyCode: i.company_code,
      companyName: i.company_name,
      cfopCode: i.cfop_code,
      cfopDescription: i.cfop_description,
      nfNumber: i.nf_number,
      requestId: i.request_id,
      clientCode: i.client_code,
      clientName: i.client_name,
      productCode: i.product_code,
      productName: i.product_name,
      boxAmount: i.box_amount,
      weightInKg: i.weight_in_kg,
      unitPrice: i.unit_price,
      totalPrice: i.total_price,
      createdAt: i.created_at,
    }));
  }
}
