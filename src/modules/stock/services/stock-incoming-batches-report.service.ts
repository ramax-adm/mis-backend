import { ExcelReaderService } from '@/core/services/excel-reader.service';
import { Injectable } from '@nestjs/common';
import { StockIncomingBatchesService } from './stock-incoming-batches.service';
import { ExcelUtils } from '@/modules/utils/services/excel.utils';
import { MarketEnum } from '@/modules/stock/enums/markets.enum';
import { NumberUtils } from '@/modules/utils/services/number.utils';
import { ExportStockIncomingBatchesReportRequestDto } from '../dtos/request/stock-incoming-batches-export-report-request.dto';
import { GetStockIncomingBatchesAnalyticalDataResponseDto } from '../dtos/response/stock-incoming-batches-get-analytical-data-response.dto';
import { GetStockIncomingBatchesResumedDataResponseDto } from '../dtos/response/stock-incoming-batches-get-resumed-data-response.dto';
import { GetStockIncomingBatchesAllDataResponseDto } from '../dtos/response/stock-incoming-batches-get-all-data-response.dto';

@Injectable()
export class StockIncomingBatchesReportService {
  constructor(
    private readonly stockIncomingBatchesService: StockIncomingBatchesService,
    private readonly excelReader: ExcelReaderService,
  ) {}

  getResumedHeaders(
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

  getAnalyticalHeaders(
    stockData: GetStockIncomingBatchesAnalyticalDataResponseDto,
  ): [string, any][] {
    const headers: [string, any][] = [];
    const excelIndexes = ExcelUtils.getArrayOfExcelColumns();
    const col = (i: number) => excelIndexes[i];

    // 1. Cabeçalhos de blocos de dados (linhas 1)
    headers.push(['A1', 'Produto']);
    headers.push(['A2', 'Cod. Empresa']);
    headers.push(['B2', 'Empresa']);
    headers.push(['C2', 'Mercado']);
    headers.push(['D2', 'Cod. Linha']);
    headers.push(['E2', 'Linha']);
    headers.push(['F2', 'Cod. Produto']);
    headers.push(['G2', 'Produto']);
    headers.push(['H2', 'Total KG']);

    // por vencimento
    const byExpireKeysSet = new Set<string>();
    Object.values(stockData.data).forEach((i) =>
      Object.keys(i.totals.byExpireRange).forEach((j) =>
        byExpireKeysSet.add(j),
      ),
    );

    headers.push(['J1', 'Por Vencimento']);
    headers.push(['J2', 'KG Vencido']);

    Array.from(byExpireKeysSet).map((i, idx) => {
      const colIdx = idx + 10; // 10 é a quantidade de colunas iniciais

      headers.push([`${col(colIdx)}2`, i]);
    });

    return headers;
  }

  getResumedValues(
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

  getAnalyticalValues(
    stockData: GetStockIncomingBatchesAnalyticalDataResponseDto,
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
    data.forEach((item) => {
      Object.keys(item.totals.byExpireRange).forEach((k) =>
        allExpireKeys.add(k),
      );
    });

    const expireKeys = Array.from(allExpireKeys);

    data.forEach((item, index) => {
      const currentRow = row(index);

      // colunas fixas
      values.push(
        [`A${currentRow}`, item.companyCode],
        [`B${currentRow}`, item.companyName],
        [`C${currentRow}`, marketMap[item.market]],
        [`D${currentRow}`, item.productLineCode],
        [`E${currentRow}`, item.productLineName],
        [`F${currentRow}`, item.productCode],
        [`G${currentRow}`, item.productName],
        [`H${currentRow}`, NumberUtils.nb2(item.totals.weightInKg)],
        [`J${currentRow}`, NumberUtils.nb2(item.totals.expiredWeightInKg)],
      );

      // totais por faixa de expiração (sempre mesmas colunas globais)
      let expireColIndex = 10; // começa em "I"
      expireKeys.forEach((key) => {
        const value = item.totals.byExpireRange[key] ?? 0;
        values.push([
          `${col(expireColIndex)}${currentRow}`,
          NumberUtils.nb2(value),
        ]);
        expireColIndex++;
      });
    });

    return values;
  }

  getAllHeaders(stockData: GetStockIncomingBatchesAllDataResponseDto) {
    const headers: [string, string][] = [];
    const excelIndexes = ExcelUtils.getArrayOfExcelColumns();
    const col = (i: number) => excelIndexes[i];

    // =====================================================
    // 🔹 1. Cabeçalhos fixos (nível 1 e 2)
    // =====================================================
    const baseHeaders: [string, string][] = [
      ['A1', 'Produto'],
      ['A2', 'Mercado'],
      ['B2', 'Cod. Linha'],
      ['C2', 'Linha'],
      ['D2', 'Cod. Produto'],
      ['E2', 'Produto'],
      ['F2', 'Total KG'],
    ];
    headers.push(...baseHeaders);

    const byExpireKeysSet = new Set<string>();
    Object.values(stockData.data).forEach((i) =>
      Array.from(i.totals.byExpireRange.keys()).forEach((key) =>
        byExpireKeysSet.add(key),
      ),
    );

    // =====================================================
    // 🔹 3. POR EMPRESA (COM SUBNÍVEIS)
    // =====================================================
    const expireKeys = Array.from(byExpireKeysSet);
    const byCompanyKeysSet = new Set<string>();
    const expireRangeKeys = expireKeys.length ? expireKeys : []; // fallback
    Object.values(stockData.data).forEach((i) =>
      Array.from(i.totals.byCompany.keys()).forEach((key) =>
        byCompanyKeysSet.add(key),
      ),
    );

    const companyKeys = Array.from(byCompanyKeysSet);

    let companyStartIdx = 6;
    headers.push([`${col(companyStartIdx)}1`, 'Por Empresa']);

    for (const company of companyKeys) {
      const subHeaders = ['Total Kg', 'Vencido', ...expireRangeKeys];

      // Linha 1 → Nome da empresa
      const span = subHeaders.length;
      headers.push([`${col(companyStartIdx)}1`, company]);

      // Linha 2 → Subcolunas
      subHeaders.forEach((sub, idx) => {
        headers.push([`${col(companyStartIdx + idx)}2`, sub]);
      });

      companyStartIdx += span;
    }

    return headers;
  }

  getAllValues(
    stockData: GetStockIncomingBatchesAllDataResponseDto,
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
    const row = (i: number) => i + 3; // começa na linha 3 (headers 1 e 2)

    // 🔹 Coletar todas as chaves globais (para alinhamento)
    const allExpireKeys = new Set<string>();
    const allCompanyKeys = new Set<string>();

    data.forEach((item) => {
      Array.from(item.totals.byExpireRange.keys()).forEach((k) =>
        allExpireKeys.add(k),
      );
      Array.from(item.totals.byCompany.keys()).forEach((k) =>
        allCompanyKeys.add(k),
      );
    });

    const expireKeys = Array.from(allExpireKeys);
    const companyKeys = Array.from(allCompanyKeys);

    // =====================================================
    // 🔹 Preencher valores linha a linha
    // =====================================================
    data.forEach((item, index) => {
      const currentRow = row(index);

      // --- Colunas fixas
      values.push(
        [`A${currentRow}`, marketMap[item.market] ?? item.market],
        [`B${currentRow}`, item.productLineCode],
        [`C${currentRow}`, item.productLineName],
        [`D${currentRow}`, item.productCode],
        [`E${currentRow}`, item.productName],
        [`F${currentRow}`, NumberUtils.nb2(item.totals.weightInKg)],
      );

      // --- Por empresa (Total, Expirado, e por Faixa)
      let companyColIndex = 6; // pula uma coluna visual
      companyKeys.forEach((companyKey) => {
        const companyTotals = item.totals.byCompany.get(companyKey);

        if (!companyTotals) {
          // se empresa não tiver registro -> zeros
          const blankCount = 2 + expireKeys.length;
          for (let i = 0; i < blankCount; i++) {
            values.push([`${col(companyColIndex + i)}${currentRow}`, 0]);
          }
          companyColIndex += blankCount;
          return;
        }

        // Total e Expirado
        values.push([
          `${col(companyColIndex++)}${currentRow}`,
          NumberUtils.nb2(companyTotals.weightInKg),
        ]);
        values.push([
          `${col(companyColIndex++)}${currentRow}`,
          NumberUtils.nb2(companyTotals.expiredWeightInKg),
        ]);

        // Por faixa
        expireKeys.forEach((rangeKey) => {
          const val = companyTotals.byExpireRange.get(rangeKey) ?? 0;
          values.push([
            `${col(companyColIndex++)}${currentRow}`,
            NumberUtils.nb2(val),
          ]);
        });
      });
    });

    return values;
  }

  async exportResumed(dto: ExportStockIncomingBatchesReportRequestDto) {
    const { market, productLineCodes } = dto.filters;

    this.excelReader.create();

    const stockData = await this.stockIncomingBatchesService.getResumedData({
      market,
      productLineCodes,
    });

    const worksheet = this.excelReader.addWorksheet(
      'Estoque - Etiquetas (RESUMO)',
    );

    const headers = this.getResumedHeaders(stockData);
    headers.forEach(([cell, value]) => {
      this.excelReader.addData(worksheet, cell, value);
    });
    const values = this.getResumedValues(stockData);
    values.forEach(([cell, value]) => {
      this.excelReader.addData(worksheet, cell, value);
    });

    return await this.excelReader.toFile();
  }

  async exportAnalytical(dto: ExportStockIncomingBatchesReportRequestDto) {
    const { market, productLineCodes, companyCode } = dto.filters;

    this.excelReader.create();

    const stockData = await this.stockIncomingBatchesService.getAnalyticalData({
      companyCode,
      market,
      productLineCodes,
    });

    const worksheet = this.excelReader.addWorksheet(
      'Estoque - Etiquetas (ANALITICO)',
    );

    const headers = this.getAnalyticalHeaders(stockData);
    headers.forEach(([cell, value]) => {
      this.excelReader.addData(worksheet, cell, value);
    });
    const values = this.getAnalyticalValues(stockData);
    values.forEach(([cell, value]) => {
      this.excelReader.addData(worksheet, cell, value);
    });

    return await this.excelReader.toFile();
  }

  async exportAll(dto: ExportStockIncomingBatchesReportRequestDto) {
    const { market, productLineCodes, companyCode } = dto.filters;

    const workbook = this.excelReader.create();

    const stockData = await this.stockIncomingBatchesService.getAllData({
      companyCode,
      market,
      productLineCodes,
    });

    const worksheet = workbook.addWorksheet('Estoque - Etiquetas (TUDO)');

    const headers = this.getAllHeaders(stockData);
    headers.forEach(([cell, value]) => {
      this.excelReader.addData(worksheet, cell, value);
    });
    const values = this.getAllValues(stockData);
    values.forEach(([cell, value]) => {
      this.excelReader.addData(worksheet, cell, value);
    });

    return await this.excelReader.toFile();
  }
}
