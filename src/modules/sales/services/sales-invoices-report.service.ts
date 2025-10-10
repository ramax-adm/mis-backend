import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ExcelReaderService,
  NumFormats,
} from '@/core/services/excel-reader.service';
import { DateUtils } from '../../utils/services/date.utils';
import { ExportSalesInvoicesReportDto } from '../dtos/request/export-human-resources-hours-report.dto';
import { SalesInvoicesService } from './sales-invoices.service';
import { GetAnalyticalSalesInvoicesReportDto } from '../dtos/response/get-analytical-sales-invoices-response.dto';
import { InvoicesSituationsEnum } from '../enums/invoices-situations.enum';

@Injectable()
export class SalesInvoicesReportService {
  constructor(
    private readonly salesInvoicesService: SalesInvoicesService,
    private readonly excelReader: ExcelReaderService,
  ) {}

  getAnalyticalHeaders(): [string, any][] {
    const headers: [string, any][] = [
      ['A1', 'Data'],
      ['B1', 'Cod Empresa'],
      ['C1', 'Empresa'],
      ['D1', 'N° NF'],
      ['E1', 'Tipo NF'],
      ['F1', 'Situação'],
      ['G1', 'Cod CFOP'],
      ['H1', 'CFOP'],
      ['I1', 'Cod Pedido'],
      ['J1', 'Cod Cliente'],
      ['K1', 'Cliente'],
      ['L1', 'Cod Produto'],
      ['M1', 'Cod Pedido'],
      ['N1', 'Caixas'],
      ['O1', 'Peso KG'],
      ['P1', 'Valor Un.'],
      ['Q1', 'Valor Nota'],
    ];

    return headers;
  }

  getAnalyticalValues(
    dto: GetAnalyticalSalesInvoicesReportDto['data'],
  ): [string, any, NumFormats | undefined][] {
    const values = [];

    const row = (i: number) => i + 2;

    dto.forEach((item, index) => {
      values.push(
        [`A${row(index)}`, DateUtils.format(item.date, 'date')],
        [`B${row(index)}`, item.companyCode],
        [`C${row(index)}`, item.companyName],
        [`D${row(index)}`, item.nfNumber],
        [`E${row(index)}`, item.nfType],
        [`F${row(index)}`, item.nfSituation],
        [`G${row(index)}`, item.cfopCode],
        [`H${row(index)}`, item.cfopDescription],
        [`I${row(index)}`, item.orderId],
        [`J${row(index)}`, item.clientCode],
        [`K${row(index)}`, item.clientName],
        [`L${row(index)}`, item.productCode],
        [`M${row(index)}`, item.productName],
        [`N${row(index)}`, item.boxAmount],
        [`O${row(index)}`, item.weightInKg],
        [`P${row(index)}`, item.unitPrice],
        [`Q${row(index)}`, item.totalPrice],
      );
    });

    return values;
  }

  async exportAnalytical(dto: ExportSalesInvoicesReportDto) {
    const {
      filters: {
        startDate,
        endDate,
        companyCode,
        cfopCodes,
        clientCode,
        nfNumber,
        nfSituations,
        nfType,
      },
    } = dto;

    const isMainFiltersChoosed = !!startDate && !!endDate && !!companyCode;
    if (!isMainFiltersChoosed) {
      throw new BadRequestException(
        'Escolha os filtros: Empresa, Dt. inicio, Dt. fim',
      );
    }

    this.excelReader.create();

    const { data } = await this.salesInvoicesService.getAnalyticalData({
      startDate,
      endDate,
      companyCode,
      cfopCodes: cfopCodes?.split(','),
      clientCode,
      nfNumber,
      nfSituations: nfSituations?.split(',') as InvoicesSituationsEnum[],
      nfType,
    });

    // filtering
    const worksheet = this.excelReader.addWorksheet(`Faturamento - Analitico`);

    const invoicesHeaders = this.getAnalyticalHeaders();
    invoicesHeaders.forEach(([cell, value]) => {
      this.excelReader.addData(worksheet, cell, value);
    });
    const invoicesValues = this.getAnalyticalValues(data);
    invoicesValues.forEach(([cell, value, numFmt]) => {
      this.excelReader.addData(worksheet, cell, value);
      if (numFmt) {
        this.excelReader.addNumFmt(worksheet, cell, numFmt);
      }
    });

    return await this.excelReader.toFile();
  }
}
