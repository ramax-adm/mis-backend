import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  GetInvoicesItem,
  GetReturnOccurrenceItem,
} from '../types/get-invoices.type';
import { NumberUtils } from '@/modules/utils/services/number.utils';
import { GetReturnOccurrencesAnalyticalDataRequestDto } from '../dtos/request/get-return-occurrences-analytical-data-request.dto';

@Injectable()
export class ReturnOccurrencesService {
  constructor(private readonly datasource: DataSource) {}

  // TODO

  async getAnalyticalData({
    companyCode,
    startDate,
    endDate,
    clientCode,
    representativeCode,
    occurrenceCauses,
    occurrenceNumber,
    returnType,
  }: GetReturnOccurrencesAnalyticalDataRequestDto) {
    const data = await this.getReturnOccurrences({
      companyCode,
      startDate,
      endDate,
      clientCode,
      representativeCode,
      occurrenceCauses,
      occurrenceNumber,
      returnType,
    });

    const occurrenceNumberSet = new Set();
    data.forEach((i) => occurrenceNumberSet.add(i.occurrenceNumber));

    const totals = data.reduce(
      (acc, item) => ({
        count: acc.count,
        fatValue: NumberUtils.nb2(acc.fatValue + item.invoiceValue),
        returnValue: NumberUtils.nb2(acc.returnValue + item.returnValue),
        returnWeightInKg: NumberUtils.nb2(
          acc.returnWeightInKg + item.returnWeightInKg,
        ),
        returnQuantity: NumberUtils.nb2(
          acc.returnQuantity + item.returnQuantity,
        ),
      }),
      {
        count: occurrenceNumberSet.size,
        fatValue: 0,
        returnValue: 0,
        returnWeightInKg: 0,
        returnQuantity: 0,
      },
    );

    return { totals, data };
  }

  private async getReturnOccurrences({
    companyCode,
    startDate,
    endDate,
    clientCode,
    representativeCode,
    occurrenceCauses,
    occurrenceNumber,
    returnType,
  }: {
    companyCode: string;
    startDate: Date;
    endDate: Date;
    clientCode?: string;
    representativeCode?: string;
    occurrenceNumber?: string;
    returnType?: string;
    occurrenceCauses?: string[];
  }): Promise<GetReturnOccurrenceItem[]> {
    const qb = this.datasource
      .createQueryBuilder()
      .select(['ro.*', 'sc.name AS company_name'])
      .from('sensatta_return_occurrences', 'ro')
      .leftJoin(
        'sensatta_companies',
        'sc',
        'ro.company_code = sc.sensatta_code',
      )
      .where('1=1')
      .andWhere('ro.company_code = :companyCode', { companyCode });

    if (startDate) {
      qb.andWhere('ro.date >= :startDate', { startDate });
    }

    if (endDate) {
      qb.andWhere('ro.date <= :endDate', { endDate });
    }

    if (clientCode) {
      qb.andWhere('ro.client_code = :clientCode', { clientCode });
    }

    if (representativeCode) {
      qb.andWhere('ro.sales_representative_code = :representativeCode', {
        representativeCode,
      });
    }

    if (occurrenceCauses) {
      qb.andWhere('ro.occurrence_cause IN (:...occurrenceCauses)', {
        occurrenceCauses,
      });
    }

    if (occurrenceNumber) {
      qb.andWhere('ro.occurrence_number = :occurrenceNumber', {
        occurrenceNumber,
      });
    }

    if (returnType) {
      qb.andWhere('ro.return_type = returnType', { returnType });
    }

    const results = await qb.getRawMany<{
      id: string;
      date?: Date;
      occurrence_number: string;
      occurrence_cause: string;
      return_type: string;
      observation: string;
      invoice_date: Date;
      re_invoicing_date: Date;
      company_code: string;
      company_name: string;
      product_code: string;
      product_name: string;
      client_code: string;
      client_name: string;
      sales_representative_code: string;
      sales_representative_name: string;
      invoice_nf: string;
      invoice_weight_in_kg: number;
      invoice_quantity: number;
      invoice_unit_value: number;
      invoice_value: number;
      return_nf: string;
      return_weight_in_kg: number;
      return_quantity: number;
      return_unit_value: number;
      return_value: number;
      re_invoicing_nf: string;
      re_invoicing_weight_in_kg: number;
      re_invoicing_quantity: number;
      re_invoicing_unit_value: number;
      re_invoicing_value: number;
      created_at: Date;
    }>();

    return results.map((i) => ({
      id: i.id,
      date: i.date,
      occurrenceNumber: i.occurrence_number,
      occurrenceCause: i.occurrence_cause,
      returnType: i.return_type,
      observation: i.observation,
      invoiceDate: i.invoice_date,
      reInvoicingDate: i.re_invoicing_date,
      companyCode: i.company_code,
      companyName: i.company_name,
      productCode: i.product_code,
      productName: i.product_name,
      clientCode: i.client_code,
      clientName: i.client_name,
      salesRepresentativeCode: i.sales_representative_code,
      salesRepresentativeName: i.sales_representative_name,
      invoiceNf: i.invoice_nf,
      invoiceWeightInKg: i.invoice_weight_in_kg,
      invoiceQuantity: i.invoice_quantity,
      invoiceUnitValue: i.invoice_unit_value,
      invoiceValue: i.invoice_value,
      returnNf: i.return_nf,
      returnWeightInKg: i.return_weight_in_kg,
      returnQuantity: i.return_quantity,
      returnUnitValue: i.return_unit_value,
      returnValue: i.return_value,
      reInvoicingNf: i.re_invoicing_nf,
      reInvoicingWeightInKg: i.re_invoicing_weight_in_kg,
      reInvoicingQuantity: i.re_invoicing_quantity,
      reInvoicingUnitValue: i.re_invoicing_unit_value,
      reInvoicingVvalue: i.re_invoicing_value,
      createdAt: i.created_at,
    }));
  }
}
