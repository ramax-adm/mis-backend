import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ExcelReaderService,
  NumFormats,
} from '@/core/services/excel-reader.service';
import { DateUtils } from '../../utils/services/date.utils';
import { AccountsReceivableService } from './accounts-receivable.service';
import { GetAccountsReceivableDataItem } from '../types/get-accounts-receivable-item.type';
import { NumberUtils } from '@/modules/utils/services/number.utils';
import { AccountReceivableBucketSituationEnum } from '../enums/account-receivable-bucket-situation.enum';
import { ExportAccountsReceivablesReportDto } from '../dtos/request/export-accounts-receivable-request.dto';

@Injectable()
export class AccountsReceivableReportService {
  constructor(
    private readonly accountsReceivableService: AccountsReceivableService,
    private readonly excelReader: ExcelReaderService,
  ) {}

  getAnalyticalHeaders(): [string, any][] {
    const headers: [string, any][] = [
      ['A1', 'Dt Base'],
      ['B1', 'Cod Empresa'],
      ['C1', 'Empresa'],
      ['D1', 'Cod Cliente'],
      ['E1', 'Cliente'],
      ['F1', 'N° Registro'],
      ['G1', 'Dt Emissão'],
      ['H1', 'Dt Venc'],
      ['I1', 'Dt Baixa'],
      ['J1', 'Dt Baixa Perda'],
      ['K1', 'Tipo Pessoa'],
      ['L1', '$ Valor'],
      ['M1', '$ Aberto'],
      ['N1', 'Dif em dias'],
      ['O1', 'Status Bucket'],
      ['P1', 'Status'],
    ];

    return headers;
  }

  getAnalyticalValues(
    dto: GetAccountsReceivableDataItem[],
  ): [string, any, NumFormats | undefined][] {
    const values = [];

    const row = (i: number) => i + 2;

    dto.forEach((item, index) => {
      values.push(
        [`A${row(index)}`, DateUtils.format(item.baseDate, 'date')],
        [`B${row(index)}`, item.companyCode],
        [`C${row(index)}`, item.companyName],
        [`D${row(index)}`, item.clientCode],
        [`E${row(index)}`, item.clientName],
        [`F${row(index)}`, item.receivableNumber],
        [`G${row(index)}`, DateUtils.format(item.issueDate, 'date')],
        [`H${row(index)}`, DateUtils.format(item.dueDate, 'date')],
        [`I${row(index)}`, DateUtils.format(item.recognitionDate, 'date')],
        [`J${row(index)}`, DateUtils.format(item.lossRecognitionDate, 'date')],
        [`K${row(index)}`, item.personType],
        [`L${row(index)}`, NumberUtils.nb2(item.value)],
        [`M${row(index)}`, NumberUtils.nb2(item.openValue)],
        [`N${row(index)}`, item.differenceInDays],
        [`O${row(index)}`, item.bucketSituation],
        [`P${row(index)}`, item.status],
      );
    });

    return values;
  }

  async exportAnalytical(dto: ExportAccountsReceivablesReportDto) {
    const {
      filters: {
        startDate,
        endDate,
        companyCodes,
        clientCode,
        bucketSituations,
        key,
        status,
        visualizationType,
      },
    } = dto;

    const isMainFiltersChoosed = !!startDate && !!endDate;
    if (!isMainFiltersChoosed) {
      throw new BadRequestException('Escolha os filtros: Dt. inicio, Dt. fim');
    }

    this.excelReader.create();

    const { data } = await this.accountsReceivableService.getAnalyticalData({
      startDate,
      endDate,
      companyCodes: companyCodes?.split(','),
      bucketSituations: bucketSituations?.split(
        ',',
      ) as AccountReceivableBucketSituationEnum[],
      clientCode,
      key,
      status,
      visualizationType,
    });

    // filtering
    const worksheet = this.excelReader.addWorksheet(
      `Titulos a Receber - Analitico`,
    );

    const accountsReceivablesHeaders = this.getAnalyticalHeaders();
    accountsReceivablesHeaders.forEach(([cell, value]) => {
      this.excelReader.addData(worksheet, cell, value);
    });
    const accountsReceivablesValues = this.getAnalyticalValues(data);
    accountsReceivablesValues.forEach(([cell, value, numFmt]) => {
      this.excelReader.addData(worksheet, cell, value);
      if (numFmt) {
        this.excelReader.addNumFmt(worksheet, cell, numFmt);
      }
    });

    return await this.excelReader.toFile();
  }
}
