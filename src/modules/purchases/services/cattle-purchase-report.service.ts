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
      ['B1', 'Cod. OC'],
      ['C1', 'Cod. Empresa'],
      ['D1', 'Empresa'],
      ['E1', 'Cod.Pecuarista'],
      ['F1', 'Pecuarista'],
      ['G1', 'Cod. Assessor'],
      ['H1', 'Assessor'],
      ['I1', 'Cabeças'],
      ['J1', 'Classificação'],
      ['K1', 'Prazo (dias)'],
      ['L1', 'Peso @'],
      ['M1', 'Peso KG'],
      ['N1', 'Valor Frete $'],
      ['O1', 'Valor Comissão $'],
      ['P1', 'Valor Compra $'],
      ['Q1', '$/Cab'],
      ['R1', '$/@'],
      ['S1', '$/KG'],
      ['T1', 'Valor Total $'],
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
        [`B${row(index)}`, item.purchaseCattleOrderId],
        [`C${row(index)}`, item.companyCode],
        [`D${row(index)}`, item.companyName],
        [`E${row(index)}`, item.cattleOwnerCode],
        [`F${row(index)}`, item.cattleOwnerName],
        [`G${row(index)}`, item.cattleAdvisorCode],
        [`H${row(index)}`, item.cattleAdvisorName],
        [`I${row(index)}`, item.cattleQuantity],
        [`J${row(index)}`, item.cattleClassification],
        [`K${row(index)}`, item.paymentTerm],
        [`L${row(index)}`, item.cattleWeightInArroba],
        [`M${row(index)}`, item.cattleWeightInKg],
        [`N${row(index)}`, item.freightPrice],
        [`O${row(index)}`, item.commissionPrice],
        [`P${row(index)}`, item.purchasePrice],
        [`Q${row(index)}`, item.headPrice],
        [`R${row(index)}`, item.arrobaPrice],
        [`S${row(index)}`, item.kgPrice],
        [`T${row(index)}`, item.totalValue],
      );
    });

    return values;
  }

  async exportAnalytical(dto: ExportCattlePurchaseReportDto) {
    const {
      filters: {
        startDate,
        endDate,
        companyCodes,
        cattleAdvisorName,
        cattleClassification,
        cattleOwnerName,
        purchaseCattleOrderId,
      },
    } = dto;

    const isMainFiltersChoosed = !!startDate && !!endDate;
    if (!isMainFiltersChoosed) {
      throw new BadRequestException(
        'Escolha os filtros: Empresa, Dt. inicio, Dt. fim',
      );
    }

    this.excelReader.create();

    const data = await this.cattlePurchaseService.getAnalyticalData({
      startDate,
      endDate,
      companyCodes: companyCodes?.split(','),
      cattleAdvisorName,
      cattleClassification,
      cattleOwnerName,
      purchaseCattleOrderId,
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
