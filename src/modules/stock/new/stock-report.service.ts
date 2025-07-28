import { BadRequestException, Injectable } from '@nestjs/common';
import { StockNewService } from './stock.service';
import {
  ExcelReaderService,
  NumFormats,
} from '@/core/services/excel-reader.service';
import { ExcelUtils } from '@/modules/utils/services/excel.utils';
import { ExportStockBalanceReportDto } from './dto/export-stock-new-report.dto';
import { DateUtils } from '@/modules/utils/services/date.utils';

@Injectable()
export class StockNewReportService {
  constructor(
    private readonly stockBalanceService: StockNewService,
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
    dto: {
      companyCode: string;
      companyName: string;
      productLineCode: string;
      productLineName: string;
      productLine: string;
      market: string;
      productCode: string;
      productName: string;
      product: string;
      weightInKg: number;
      quantity: number;
      reservedWeightInKg: number;
      reservedQuantity: number;
      availableWeightInKg: number;
      availableQuantity: number;
      createdAt: Date;
    }[],
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

    values.push(['N2', DateUtils.format(dto[0].createdAt, 'date')]);

    return values;
  }

  async exportAnalytical(dto: ExportStockBalanceReportDto) {
    const {
      filters: { companyCode, market, productLineCode },
    } = dto;

    this.excelReader.create();

    const data = await this.stockBalanceService.getDataWithPartialFilters({
      companyCode,
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
