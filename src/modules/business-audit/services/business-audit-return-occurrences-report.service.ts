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
import { MarketEnum } from '@/modules/stock/enums/markets.enum';
import { BusinessAuditReturnOccurrencesService } from './business-audit-return-occurrences.service';
import { ReturnOccurrence } from '@/modules/sales/entities/return-occurrence.entity';
import { GetBusinessAuditReturnOccurrencesDataResponseDto } from '../dtos/response/get-business-return-ocurrences-data-response.dto';
import { OccurrenceAgg } from '../types/get-return-occurrences-data.type';

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
      ['L1', 'Cod. Produto'],
      ['M1', 'Produto'],
      ['N1', 'Qtd Faturamento'],
      ['O1', 'Qtd Devolução'],
      ['P1', 'KG Faturamento'],
      ['Q1', 'KG Devolução'],
      ['R1', 'Valor Faturamento'],
      ['S1', 'Valor Devolução'],
      ['T1', 'Motivo'],
      ['U1', 'Tipo Devolução'],
    ];

    return headers;
  }

  getOccurrencesAggHeaders(): [string, any][] {
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
      ['L1', 'Qtd Faturamento'],
      ['M1', 'Qtd Devolução'],
      ['N1', 'KG Faturamento'],
      ['O1', 'KG Devolução'],
      ['P1', 'Valor Faturamento'],
      ['Q1', 'Valor Devolução'],
      ['R1', 'Motivo'],
      ['S1', 'Tipo Devolução'],
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
        [`L${row(index)}`, item.productCode],
        [`M${row(index)}`, item.productName],
        [`N${row(index)}`, item.invoiceQuantity],
        [`O${row(index)}`, item.returnQuantity],
        [`P${row(index)}`, NumberUtils.nb2(item.invoiceWeightInKg ?? 0)],
        [`Q${row(index)}`, NumberUtils.nb2(item.returnWeightInKg ?? 0)],
        [`R${row(index)}`, NumberUtils.nb2(item.invoiceValue ?? 0)],
        [`S${row(index)}`, NumberUtils.nb2(item.returnValue ?? 0)],
        [`T${row(index)}`, item.occurrenceCause],
        [`U${row(index)}`, item.returnType],
      );
    });

    return values;
  }

  getOccurrencesAggValues(
    dto: Record<string, OccurrenceAgg>,
  ): [string, any, NumFormats | undefined][] {
    const values = [];

    const row = (i: number) => i + 2; // começa da linha 2 (linha 1 = header)

    Object.values(dto).forEach((item, index) => {
      values.push(
        [`A${row(index)}`, DateUtils.format(item.invoiceDate, 'date')],
        [`B${row(index)}`, DateUtils.format(item.date, 'date')],
        [`C${row(index)}`, item.occurrenceNumber],
        [`D${row(index)}`, item.companyCode],
        [`E${row(index)}`, item.companyName],
        [`F${row(index)}`, item.invoiceNfNumber],
        [`G${row(index)}`, item.returnNfNumber],
        [`H${row(index)}`, item.clientCode],
        [`I${row(index)}`, item.clientName],
        [`J${row(index)}`, item.salesRepresentativeCode],
        [`K${row(index)}`, item.salesRepresentativeName],
        [`L${row(index)}`, item.invoiceQuantity],
        [`M${row(index)}`, item.returnQuantity],
        [`N${row(index)}`, NumberUtils.nb2(item.invoiceWeightInKg ?? 0)],
        [`O${row(index)}`, NumberUtils.nb2(item.returnWeightInKg ?? 0)],
        [`P${row(index)}`, NumberUtils.nb2(item.invoiceValue ?? 0)],
        [`Q${row(index)}`, NumberUtils.nb2(item.returnValue ?? 0)],
        [`R${row(index)}`, item.occurrenceCause],
        [`S${row(index)}`, item.returnType],
      );
    });

    return values;
  }

  async exportReturnOccurrences(dto: ExportBusinessAuditReportDto) {
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

    const { occurrences } =
      await this.businessAuditReturnOccurrencesService.getData({
        startDate,
        endDate,
        companyCodes: companyCodes?.split(','),
        clientCodes: clientCodes?.split(','),
        representativeCodes: salesRepresentativeCodes?.split(','),
        occurrenceCauses: occurrenceCauses?.split(','),
        occurrenceNumber: occurrenceNumber,
        returnType: returnType,
      });

    const returnOccurrences =
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
    const occurrencesAggWorksheet = this.excelReader.addWorksheet(
      `Monitoramento - Devoluções`,
    );
    const returnOccurrencesWorksheet = this.excelReader.addWorksheet(
      `Monitoramento - Itens Devolução`,
    );

    const occurrencesAggHeaders = this.getOccurrencesAggHeaders();
    occurrencesAggHeaders.forEach(([cell, value]) => {
      this.excelReader.addData(occurrencesAggWorksheet, cell, value);
    });
    const returnOccurrencesHeaders = this.getReturnOccurrencesHeaders();
    returnOccurrencesHeaders.forEach(([cell, value]) => {
      this.excelReader.addData(returnOccurrencesWorksheet, cell, value);
    });
    const returnOccurrencesValues =
      this.getReturnOccurrencesValues(returnOccurrences);
    returnOccurrencesValues.forEach(([cell, value, numFmt]) => {
      this.excelReader.addData(returnOccurrencesWorksheet, cell, value);
      if (numFmt) {
        this.excelReader.addNumFmt(returnOccurrencesWorksheet, cell, numFmt);
      }
    });
    const occurrencesAggValues = this.getOccurrencesAggValues(occurrences.data);
    occurrencesAggValues.forEach(([cell, value, numFmt]) => {
      this.excelReader.addData(occurrencesAggWorksheet, cell, value);
      if (numFmt) {
        this.excelReader.addNumFmt(occurrencesAggWorksheet, cell, numFmt);
      }
    });

    return await this.excelReader.toFile();
  }
}
