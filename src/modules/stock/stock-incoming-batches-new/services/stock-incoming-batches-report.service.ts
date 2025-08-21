import { ExcelReaderService } from '@/core/services/excel-reader.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { StockIncomingBatchesService } from './stock-incoming-batches.service';
import { GetStockIncomingBatchesResumedDataResponseDto } from '../dtos/response/get-stock-incoming-batches-resumed-data-response.dto';
import { ExportStockReportDto } from '../../stock-incoming-batches/dto/export-stock-report.dto';
import { NumberUtils } from '@/modules/utils/services/number.utils';
import { ExportStockIncomingBatchesReportRequestDto } from '../dtos/request/export-stock-incoming-batches-report-request.dto';
import { MarketEnum } from '@/core/enums/sensatta/markets.enum';
import { ExcelUtils } from '@/modules/utils/services/excel.utils';

@Injectable()
export class StockIncomingBatchesReportService {
  constructor(
    private readonly stockIncomingBatchesService: StockIncomingBatchesService,
    private readonly excelReader: ExcelReaderService,
  ) {}

  getResumedStockDataHeaders(
    stockData: GetStockIncomingBatchesResumedDataResponseDto,
  ): [string, any][] {
    const headers: [string, any][] = [];
    const excelIndexes = ExcelUtils.getArrayOfExcelColumns();
    const col = (i: number) => excelIndexes[i];

    // 1. Cabeçalhos de blocos de dados (linhas 1)
    headers.push(['A1', 'Produto']);
    headers.push(['A2', 'Mercado']);
    headers.push(['B2', 'Cod. Linha']);
    headers.push(['C2', 'Linha']);
    headers.push(['D2', 'Cod. Produto']);
    headers.push(['E2', 'Produto']);
    headers.push(['F2', 'Total KG']);

    // por vencimento
    const byExpireKeysSet = new Set<string>();
    Object.values(stockData.data).forEach((i) =>
      Object.keys(i.totals.byExpireRange).forEach((j) =>
        byExpireKeysSet.add(j),
      ),
    );

    headers.push(['H1', 'Por Vencimento']);
    headers.push(['H2', 'KG Vencido']);

    Array.from(byExpireKeysSet).map((i, idx) => {
      const colIdx = idx + 8; // 8 é a quantidade de colunas iniciais

      headers.push([`${col(colIdx)}2`, i]);
    });

    // por empresa
    const byCompanyKeysSet = new Set<string>();
    Object.values(stockData.data).forEach((i) =>
      Object.keys(i.totals.byCompany).forEach((j) => byCompanyKeysSet.add(j)),
    );

    const initialIdx = byExpireKeysSet.size + 9; // 8 é a quantidade de colunas iniciais
    headers.push([`${col(initialIdx)}1`, 'Por Empresa']);

    Array.from(byCompanyKeysSet).map((i, idx) => {
      const colIdx = idx + initialIdx; // 9 é a quantidade de colunas iniciais

      headers.push([`${col(colIdx)}2`, i]);
    });

    return headers;
  }

  getResumedStockDataValues(
    stockData: GetStockIncomingBatchesResumedDataResponseDto,
  ): [string, any][] {
    const data = Object.values(stockData.data);
    const values: [string, any][] = [];

    const marketMap = {
      [MarketEnum.BOTH]: 'Ambos',
      [MarketEnum.ME]: 'ME',
      [MarketEnum.MI]: 'MI',
    };

    const excelIndexes = ExcelUtils.getArrayOfExcelColumns();
    const col = (i: number) => excelIndexes[i];
    const row = (i: number) => i + 3;

    // coletar todas as chaves globais (para garantir alinhamento com headers)
    const allExpireKeys = new Set<string>();
    const allCompanyKeys = new Set<string>();
    data.forEach((item) => {
      Object.keys(item.totals.byExpireRange).forEach((k) =>
        allExpireKeys.add(k),
      );
      Object.keys(item.totals.byCompany).forEach((k) => allCompanyKeys.add(k));
    });

    const expireKeys = Array.from(allExpireKeys);
    const companyKeys = Array.from(allCompanyKeys);

    data.forEach((item, index) => {
      const currentRow = row(index);

      // colunas fixas
      values.push(
        [`A${currentRow}`, marketMap[item.market]],
        [`B${currentRow}`, item.productLineCode],
        [`C${currentRow}`, item.productLineName],
        [`D${currentRow}`, item.productCode],
        [`E${currentRow}`, item.productName],
        [`F${currentRow}`, NumberUtils.nb2(item.totals.weightInKg)],
        [`H${currentRow}`, NumberUtils.nb2(item.totals.expiredWeightInKg)],
      );

      // totais por faixa de expiração (sempre mesmas colunas globais)
      let expireColIndex = 8; // começa em "I"
      expireKeys.forEach((key) => {
        const value = item.totals.byExpireRange[key] ?? 0;
        values.push([
          `${col(expireColIndex)}${currentRow}`,
          NumberUtils.nb2(value),
        ]);
        expireColIndex++;
      });

      // totais por empresa (sempre mesmas colunas globais)
      let companyColIndex = expireColIndex + 1;
      companyKeys.forEach((key) => {
        const value = item.totals.byCompany[key] ?? 0;
        values.push([
          `${col(companyColIndex)}${currentRow}`,
          NumberUtils.nb2(value),
        ]);
        companyColIndex++;
      });
    });

    return values;
  }

  async exportResumed(dto: ExportStockIncomingBatchesReportRequestDto) {
    const { market, productLineCodes } = dto.filters;
    console.log({ market, productLineCodes });

    this.excelReader.create();

    const stockData = await this.stockIncomingBatchesService.getResumedData({
      market,
      productLineCodes,
    });

    const worksheet = this.excelReader.addWorksheet('Estoque - Etiquetas');

    const headers = this.getResumedStockDataHeaders(stockData);
    headers.forEach(([cell, value]) => {
      this.excelReader.addData(worksheet, cell, value);
    });
    const values = this.getResumedStockDataValues(stockData);
    values.forEach(([cell, value]) => {
      this.excelReader.addData(worksheet, cell, value);
    });

    return await this.excelReader.toFile();
  }
}
