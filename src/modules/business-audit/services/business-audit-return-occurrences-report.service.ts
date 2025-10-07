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
import { GetBusinessSalesOrderLinesResponseDto } from '../dtos/response/get-business-sales-order-lines-response.dto';
import { OrderLine } from '@/modules/sales/entities/order-line.entity';
import { MarketEnum } from '@/core/enums/sensatta/markets.enum';
import { BusinessAuditReturnOccurrencesService } from './business-audit-return-occurrences.service';
import { ReturnOccurrence } from '@/modules/sales/entities/return-occurrence.entity';

@Injectable()
export class BusinessAuditReturnOccurrencesReportService {
  constructor(
    private readonly businessAuditReturnOccurrencesService: BusinessAuditReturnOccurrencesService,
    private readonly excelReader: ExcelReaderService,
  ) {}

  private getMarket(market: string) {
    const marketMap = {
      [MarketEnum.ME]: 'ME',
      [MarketEnum.MI]: 'MI',
    };

    return marketMap[market];
  }

  getReturnOccurrencesHeaders(): [string, any][] {
    const headers: [string, any][] = [
      ['A1', 'Data Faturamento'],
      ['B1', 'Data Devolução'],
      ['C1', 'B.O'],
      ['D1', 'Cod Empresa'],
      ['E1', 'Empresa'],
      ['F1', 'NF Faturamento'],
      ['G1', 'NF Devolução'],
      ['H1', 'Cod. Cliente'],
      ['I1', 'Cliente'],
      ['J1', 'Cod. Representante'],
      ['K1', 'Representante'],
      ['L1', 'Qtd Itens Faturamento'],
      ['M1', 'Qtd Itens Devolução'],
      ['N1', 'Valor Faturamento'],
      ['O1', 'Valor Devolução'],
      ['P1', 'Motivo'],
      ['Q1', 'Tipo Devolução'],
    ];

    return headers;
  }

  getReturnOccurrencesValues(
    dto: ReturnOccurrence[],
  ): [string, any, NumFormats | undefined][] {
    const values = [];

    const row = (i: number) => i + 2; // começa da linha 2 (linha 1 = header)

    dto.forEach((item, index) => {
      values.push(
        [`A${row(index)}`, DateUtils.format(item.invoiceDate, 'date')],
        [`B${row(index)}`, DateUtils.format(item.date, 'date')],
        [`C${row(index)}`, item.occurrenceNumber],
        [`D${row(index)}`, item.companyCode],
        [`E${row(index)}`, item.companyName],
        [`F${row(index)}`, item.invoiceNf],
        [`G${row(index)}`, item.returnNf],
        [`H${row(index)}`, item.clientCode],
        [`I${row(index)}`, item.clientName],
        [`J${row(index)}`, item.salesRepresentativeCode],
        [`K${row(index)}`, item.salesRepresentativeName],
        [`L${row(index)}`, item.invoiceQuantity],
        [`M${row(index)}`, item.returnQuantity],
        [`N${row(index)}`, NumberUtils.nb2(item.invoiceValue ?? 0)],
        [`O${row(index)}`, NumberUtils.nb2(item.returnValue ?? 0)],
        [`P${row(index)}`, item.occurrenceCause],
        [`Q${row(index)}`, item.returnType],
      );
    });

    return values;
  }

  async exportSalesByInvoice(dto: ExportBusinessAuditReportDto) {
    const {
      filters: {
        startDate,
        endDate,
        companyCodes,
        clientCodes,
        salesRepresentativeCodes,
        occurrenceCauses,
        occurrenceNumber,
        returnType,
      },
    } = dto;

    const isMainFiltersChoosed = !!startDate && !!endDate;
    if (!isMainFiltersChoosed) {
      throw new BadRequestException('Escolha os filtros:Dt. inicio, Dt. fim');
    }

    this.excelReader.create();

    const data =
      await this.businessAuditReturnOccurrencesService.getReturnOccurrences({
        startDate,
        endDate,
        companyCodes: companyCodes?.split(','),
        clientCodes: clientCodes?.split(','),
        representativeCodes: salesRepresentativeCodes?.split(','),
        occurrenceCauses: occurrenceCauses?.split(','),
        occurrenceNumber: occurrenceNumber,
        returnType: returnType,
      });

    // filtering
    const worksheet = this.excelReader.addWorksheet(
      `Monitoramento - Devoluções`,
    );

    const returnOccurrencesHeaders = this.getReturnOccurrencesHeaders();
    returnOccurrencesHeaders.forEach(([cell, value]) => {
      this.excelReader.addData(worksheet, cell, value);
    });
    const returnOccurrencesValues = this.getReturnOccurrencesValues(data);
    returnOccurrencesValues.forEach(([cell, value, numFmt]) => {
      this.excelReader.addData(worksheet, cell, value);
      if (numFmt) {
        this.excelReader.addNumFmt(worksheet, cell, numFmt);
      }
    });

    return await this.excelReader.toFile();
  }
}
