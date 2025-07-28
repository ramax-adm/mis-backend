import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class SalesReturnInvoicesService {
  constructor(private readonly datasource: DataSource) {}

  getResumedData() {}

  getAnalyticalData({
    companyCode,
    clientCode,
    productCode,
    salesRepresentativeCode,
    startDate,
    endDate,
  }: {
    companyCode: string;
    startDate: Date;
    endDate: Date;
    clientCode: string;
    salesRepresentativeCode: string;
    productCode: string;
  }) {}
}
