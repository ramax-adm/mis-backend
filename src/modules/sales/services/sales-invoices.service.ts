import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InvoicesNfTypesEnum } from '../enums/invoices-nf-types.enum';
import { InvoicesSituationsEnum } from '../enums/invoices-situations.enum';

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
  getAnalyticalData({
    companyCode,
    startDate,
    endDate,
    clientCode,
    cfopCode,
    nfType,
    nfNumber,
    nfSituation,
  }: {
    companyCode: string;
    startDate: Date;
    endDate: Date;
    clientCode: string;
    cfopCode: string;
    nfType: InvoicesNfTypesEnum;
    nfNumber: string;
    nfSituation: InvoicesSituationsEnum;
  }) {
    return this.getInvoices({
      companyCode,
      startDate,
      endDate,
      clientCode,
      cfopCode,
      nfType,
      nfNumber,
      nfSituation,
    });
  }

  private getInvoices({
    companyCode,
    startDate,
    endDate,
    clientCode,
    cfopCode,
    nfType,
    nfNumber,
    nfSituation,
  }: {
    companyCode: string;
    startDate?: Date;
    endDate?: Date;
    clientCode?: string;
    cfopCode?: string;
    nfType?: InvoicesNfTypesEnum;
    nfNumber?: string;
    nfSituation?: InvoicesSituationsEnum;
  }) {
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

    if (cfopCode) {
      qb.andWhere('si.cfop_code = :cfopCode', { cfopCode });
    }

    if (clientCode) {
      qb.andWhere('si.client_code = :clientCode', { clientCode });
    }

    if (nfSituation) {
      qb.andWhere('si.nf_situation = :nfSituation', { nfSituation });
    }

    if (startDate) {
      qb.andWhere('si.date >= :startDate', { startDate });
    }

    if (endDate) {
      qb.andWhere('si.date <= :endDate', { endDate });
    }

    return qb.getRawMany();
  }
}
