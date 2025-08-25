import { BadRequestException, Injectable } from '@nestjs/common';
import { StockBalanceService } from './stock-balance.service';
import {
  ExcelReaderService,
  NumFormats,
} from '@/core/services/excel-reader.service';
import { ExportStockBalanceReportDto } from '../dtos/export-stock-new-report.dto';
import { DateUtils } from '@/modules/utils/services/date.utils';
import { GetStockBalanceItem } from '../types/get-stock-balance.type';

@Injectable()
export class StockBalanceReportService {
  constructor(
    private readonly stockBalanceService: StockBalanceService,
    private readonly excelReader: ExcelReaderService,
  ) {}

  getAnalyticalHeaders(): [string, any][] {
    const headers: [string, any][] = [
      ['A1', 'Cod. Empresa'],
      ['B1', 'Empresa'],
      ['C1', 'Cod. Linha'],
      ['D1', 'Linha'],
      ['E1', 'Mercado'],
      ['F1', 'Cod Produto'],
      ['G1', 'Produto'],
      ['H1', 'KG Estoque'],
      ['I1', 'Cx Estoque'],
      ['J1', 'KG Pedido'],
      ['K1', 'Cx Pedido'],
      ['L1', 'KG Disp'],
      ['M1', 'Cx Disp'],
      ['N1', 'Dt Base'],
    ];

    return headers;
  }

  getAnalyticalValues(
    dto: GetStockBalanceItem[],
  ): [string, any, NumFormats | undefined][] {
    const values = [];

    const row = (i: number) => i + 2;

    dto.forEach((item, index) => {
      values.push(
        [`A${row(index)}`, item.companyCode],
        [`B${row(index)}`, item.companyName],
        [`C${row(index)}`, item.productLineCode],
        [`D${row(index)}`, item.productLine],
        [`E${row(index)}`, item.market],
        [`F${row(index)}`, item.productCode],
        [`G${row(index)}`, item.product],
        [`H${row(index)}`, item.weightInKg],
        [`I${row(index)}`, item.quantity],
        [`J${row(index)}`, item.reservedWeightInKg],
        [`K${row(index)}`, item.reservedQuantity],
        [`L${row(index)}`, item.availableWeightInKg],
        [`M${row(index)}`, item.availableQuantity],
      );
    });

    values.push(['N2', DateUtils.format(dto[0]?.createdAt, 'date')]);

    return values;
  }

  async exportAnalytical(dto: ExportStockBalanceReportDto) {
    const { companyCode, market, productLineCode } = dto.filters;

    this.excelReader.create();

    const data = await this.stockBalanceService.getData({
      companyCode,
      market,
      productLineCode,
    });

    // filtering
    const worksheet = this.excelReader.addWorksheet(`Estoque - Analitico`);

    const stockHeaders = this.getAnalyticalHeaders();
    stockHeaders.forEach(([cell, value]) => {
      this.excelReader.addData(worksheet, cell, value);
    });
    const stockValues = this.getAnalyticalValues(data);
    stockValues.forEach(([cell, value, numFmt]) => {
      this.excelReader.addData(worksheet, cell, value);
      if (numFmt) {
        this.excelReader.addNumFmt(worksheet, cell, numFmt);
      }
    });

    return await this.excelReader.toFile();
  }
}
