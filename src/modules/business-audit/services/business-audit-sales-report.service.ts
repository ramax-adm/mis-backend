import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ExcelReaderService,
  NumFormats,
} from '@/core/services/excel-reader.service';
import { DateUtils } from '../../utils/services/date.utils';
import { BusinessAuditOverviewService } from './business-audit-overview.service';
import { GetBusinessAuditSalesDataResponseDto } from '../dtos/response/get-business-sales-data-response.dto';
import { BusinessAuditSalesService } from './business-audit-sales.service';
import { ExportBusinessAuditReportDto } from '../dtos/request/export-business-audit-report-request.dto';
import { NumberUtils } from '@/modules/utils/services/number.utils';

@Injectable()
export class BusinessAuditSalesReportService {
  constructor(
    private readonly businessAuditSalesService: BusinessAuditSalesService,
    private readonly excelReader: ExcelReaderService,
  ) {}

  getSalesByInvoiceHeaders(): [string, any][] {
    const headers: [string, any][] = [
      ['A1', 'Data Faturamento'],
      ['B1', 'Cod. Empresa'],
      ['C1', 'Empresa'],
      ['D1', 'Mercado'],
      ['E1', 'N° Pedido'],
      ['F1', 'N° NF'],
      ['G1', 'Qtd. Itens NF'],
      ['H1', 'Cod CFOP'],
      ['I1', 'CFOP'],
      ['J1', 'Cliente'],
      ['K1', 'Representante'],
      ['L1', 'Prazo'],
      ['M1', '$ Faturamento'],
      ['N1', '$ Tabela'],
      ['O1', '$ Desc'],
    ];

    return headers;
  }

  getSalesByInvoiceValues(
    dto: GetBusinessAuditSalesDataResponseDto['salesByInvoice'],
  ): [string, any, NumFormats | undefined][] {
    const values = [];

    const row = (i: number) => i + 2;

    const data = Object.values(dto.data);

    data.forEach((item, index) => {
      values.push(
        [`A${row(index)}`, DateUtils.format(item.date, 'date')],
        [`B${row(index)}`, item.companyCode],
        [`C${row(index)}`, item.companyName],
        [`D${row(index)}`, item.market],
        [`E${row(index)}`, item.orderNumber],
        [`F${row(index)}`, item.nfNumber],
        [`G${row(index)}`, item.salesCount],
        [`H${row(index)}`, item.cfopCode],
        [`I${row(index)}`, item.cfopDescription],
        [`J${row(index)}`, item.clientName],
        [`K${row(index)}`, item.representativeName],
        [`L${row(index)}`, item.paymentTerm],
        [`M${row(index)}`, NumberUtils.nb2(item.totalFatValue)],
        [`N${row(index)}`, NumberUtils.nb2(item.totalTableValue)],
        [`O${row(index)}`, NumberUtils.nb2(item.totalDiff)],
      );
    });

    return values;
  }

  async exportSalesByInvoice(dto: ExportBusinessAuditReportDto) {
    const {
      filters: { startDate, endDate, companyCodes, market, priceConsideration },
    } = dto;

    const isMainFiltersChoosed = !!startDate && !!endDate;
    if (!isMainFiltersChoosed) {
      throw new BadRequestException('Escolha os filtros:Dt. inicio, Dt. fim');
    }

    this.excelReader.create();

    const data = await this.businessAuditSalesService.getSalesAuditData({
      startDate,
      endDate,
      companyCodes: companyCodes.split(','),
      market,
      priceConsideration,
    });
    // filtering
    const worksheet = this.excelReader.addWorksheet(
      `Monitoramento - Vendas por NF`,
    );

    const salesByInvoiceHeaders = this.getSalesByInvoiceHeaders();
    salesByInvoiceHeaders.forEach(([cell, value]) => {
      this.excelReader.addData(worksheet, cell, value);
    });
    const salesByInvoiceValues = this.getSalesByInvoiceValues(
      data.salesByInvoice,
    );
    salesByInvoiceValues.forEach(([cell, value, numFmt]) => {
      this.excelReader.addData(worksheet, cell, value);
      if (numFmt) {
        this.excelReader.addNumFmt(worksheet, cell, numFmt);
      }
    });

    return await this.excelReader.toFile();
  }
}
