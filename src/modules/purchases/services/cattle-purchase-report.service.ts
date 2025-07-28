import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ExcelReaderService,
  NumFormats,
} from '@/core/services/excel-reader.service';
import { DateUtils } from '../../utils/services/date.utils';
import { CattlePurchaseService } from './cattle-purchase.service';
import { GetAnalyticalCattlePurchaseResponseDto } from '../dtos/get-analytical-cattle-purchase-response.dto';
import { ExportCattlePurchaseReportDto } from '../dtos/export-cattle-purchase-report.dto';

@Injectable()
export class CattlePurchaseReportService {
  constructor(
    private readonly cattlePurchaseService: CattlePurchaseService,
    private readonly excelReader: ExcelReaderService,
  ) {}

  getAnalyticalHeaders(): [string, any][] {
    const headers: [string, any][] = [
      ['A1', 'Data'],
      ['B1', 'Cod. Empresa'],
      ['C1', 'Empresa'],
      ['D1', 'Cod. OC'],
      ['E1', 'Pecuarista'],
      ['F1', 'Assessor'],
      ['G1', 'Cbs'],
      ['H1', 'Classificação'],
      ['I1', 'Peso @'],
      ['J1', 'Prazo Pgt'],
      ['K1', 'Valor Frete R$'],
      ['L1', 'Valor Comissão R$'],
      ['M1', 'Valor Compra R$'],
      ['N1', 'Valor Total R$'],
    ];

    return headers;
  }

  getAnalyticalValues(
    dto: GetAnalyticalCattlePurchaseResponseDto[],
  ): [string, any, NumFormats | undefined][] {
    const values = [];

    const row = (i: number) => i + 2;

    dto.forEach((item, index) => {
      values.push(
        [`A${row(index)}`, DateUtils.format(item.slaughterDate, 'date')],
        [`B${row(index)}`, item.companyCode],
        [`C${row(index)}`, item.companyName],
        [`D${row(index)}`, item.purchaseCattleOrderId],
        [`E${row(index)}`, item.cattleOwnerName],
        [`F${row(index)}`, item.cattleAdvisorName],
        [`G${row(index)}`, item.cattleQuantity],
        [`H${row(index)}`, item.cattleClassification],
        [`I${row(index)}`, item.cattleWeightInArroba],
        [`J${row(index)}`, item.paymentTerm],
        [`K${row(index)}`, item.freightPrice],
        [`L${row(index)}`, item.commissionPrice],
        [`M${row(index)}`, item.purchasePrice],
        [`N${row(index)}`, item.totalValue],
      );
    });

    return values;
  }

  async exportAnalytical(dto: ExportCattlePurchaseReportDto) {
    const {
      filters: {
        startDate,
        endDate,
        companyCode,
        cattleAdvisorName,
        cattleClassification,
        cattleOwnerName,
      },
    } = dto;

    const isMainFiltersChoosed = !!startDate && !!endDate && !!companyCode;
    if (!isMainFiltersChoosed) {
      throw new BadRequestException(
        'Escolha os filtros: Empresa, Dt. inicio, Dt. fim',
      );
    }

    this.excelReader.create();

    const data = await this.cattlePurchaseService.getAnalyticalData({
      startDate,
      endDate,
      companyCode,
      cattleAdvisorName,
      cattleClassification,
      cattleOwnerName,
    });

    // filtering
    const worksheet = this.excelReader.addWorksheet(
      `Compra de Gado - Analitico`,
    );

    const cattlePurchaseHeaders = this.getAnalyticalHeaders();
    cattlePurchaseHeaders.forEach(([cell, value]) => {
      this.excelReader.addData(worksheet, cell, value);
    });
    const cattlePurchaseValues = this.getAnalyticalValues(data);
    cattlePurchaseValues.forEach(([cell, value, numFmt]) => {
      this.excelReader.addData(worksheet, cell, value);
      if (numFmt) {
        this.excelReader.addNumFmt(worksheet, cell, numFmt);
      }
    });

    return await this.excelReader.toFile();
  }
}
