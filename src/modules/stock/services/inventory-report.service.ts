import { Injectable } from '@nestjs/common';
import {
  ExcelReaderService,
  NumFormats,
} from '@/core/services/excel-reader.service';
import { InventoryService } from './inventory.service';
import { InventoryGetAnalyticalDataResponseDto } from '../dtos/response/inventory-get-analytical-data-response.dto';
import { ExcelUtils } from '@/modules/utils/services/excel.utils';
import { InventoryExportReportRequestDto } from '../dtos/request/inventory-export-report-request.dto';
import { InventoryGetResumeDataResponseDto } from '../dtos/response/inventory-get-resume-data-response.dto';
import { DateUtils } from '@/modules/utils/services/date.utils';

@Injectable()
export class InventoryReportService {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly excelReader: ExcelReaderService,
  ) {}

  getAnalyticalHeaders({
    data,
  }: InventoryGetAnalyticalDataResponseDto): [string, any][] {
    const headers: [string, any][] = [
      ['A1', 'Inventario'],
      ['B1', 'Cod. Almoxarifado'],
      ['C1', 'Cod. Produto'],
      ['D1', 'Produto'],
      ['E1', 'N° Caixa'],
      ['F1', 'SIF'],
      ['G1', 'Dt. Produção'],
      ['H1', 'Dt. Vencimento'],
      ['I1', 'Peso KG'],
    ];

    data.forEach((item) => {
      Object.values(item.events).map((value, index) => {
        const columnIndex = ExcelUtils.getColumnIndex(9 + index);
        return headers.push([`${columnIndex}1`, `Evento ${index + 1}`]);
      });
    });

    return headers;
  }

  getAnalyticalValues({
    data,
  }: InventoryGetAnalyticalDataResponseDto): [
    string,
    any,
    NumFormats | undefined,
  ][] {
    const values = [];

    const row = (i: number) => i + 2;

    data.forEach((item, dataIndex) => {
      values.push(
        [`A${row(dataIndex)}`, item.inventoryId],
        [`B${row(dataIndex)}`, item.warehouseCode],
        [`C${row(dataIndex)}`, item.productCode],
        [`D${row(dataIndex)}`, item.productName],
        [`E${row(dataIndex)}`, item.boxNumber],
        [`F${row(dataIndex)}`, item.sifCode],
        [`G${row(dataIndex)}`, DateUtils.format(item.productionDate, 'date')],
        [`H${row(dataIndex)}`, DateUtils.format(item.dueDate, 'date')],
        [`I${row(dataIndex)}`, item.weightInKg],
      );

      Object.values(item.events).map((value, eventIndex) => {
        const columnIndex = ExcelUtils.getColumnIndex(9 + eventIndex);
        return values.push([`${columnIndex}${row(dataIndex)}`, value]);
      });
    });

    return values;
  }

  getResumeHeaders({
    data,
  }: InventoryGetResumeDataResponseDto): [string, any][] {
    const headers: [string, any][] = [
      ['A1', 'Inventario'],
      ['B1', 'Cod. Almoxarifado'],
      ['C1', 'Cod. Produto'],
      ['D1', 'Produto'],
      ['E1', 'Qtd. Inventario'],
      ['F1', 'KG Inventario'],
      ['G1', 'Qtd. Estoque'],
      ['H1', 'KG Estoque'],
      ['I1', 'Qtd. Bloqueado'],
      ['J1', 'KG Bloqueado'],
      ['K1', 'Qtd. Cancelado'],
      ['L1', 'KG Cancelado'],
      ['M1', 'Qtd. Expedido'],
      ['N1', 'KG Expedido'],
      ['O1', 'Qtd. Dif'],
      ['P1', 'KG Dif'],
    ];

    return headers;
  }

  getResumeValues({
    data,
  }: InventoryGetResumeDataResponseDto): [
    string,
    any,
    NumFormats | undefined,
  ][] {
    const values = [];

    const row = (i: number) => i + 2;

    data.forEach((item, dataIndex) => {
      values.push(
        [`A${row(dataIndex)}`, item.inventoryId],
        [`B${row(dataIndex)}`, item.warehouseCode],
        [`C${row(dataIndex)}`, item.productCode],
        [`D${row(dataIndex)}`, item.productName],
        [`E${row(dataIndex)}`, item.inventoryQuantity],
        [`F${row(dataIndex)}`, item.inventoryWeightInKg],
        [`G${row(dataIndex)}`, item.stockQuantity],
        [`H${row(dataIndex)}`, item.stockWeightInKg],
        [`I${row(dataIndex)}`, item.blockedQuantity],
        [`J${row(dataIndex)}`, item.blockedWeightInKg],
        [`K${row(dataIndex)}`, item.cancelatedQuantity],
        [`L${row(dataIndex)}`, item.cancelatedWeightInKg],
        [`M${row(dataIndex)}`, item.dispatchedQuantity],
        [`N${row(dataIndex)}`, item.dispatchedWeightInKg],
        [`O${row(dataIndex)}`, item.quantityDif],
        [`P${row(dataIndex)}`, item.weightInKgDif],
      );
    });

    return values;
  }

  async exportAnalytical(dto: InventoryExportReportRequestDto) {
    const { companyCode, boxNumber, inventoryId } = dto.filters;

    this.excelReader.create();

    const data = await this.inventoryService.getAnalyticalData({
      companyCode,
      inventoryId,
      boxNumber,
    });

    // filtering
    const worksheet = this.excelReader.addWorksheet(`Inventario - Analitico`);

    const stockHeaders = this.getAnalyticalHeaders(data);
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

  async exportResumed(dto: InventoryExportReportRequestDto) {
    const { companyCode, inventoryId } = dto.filters;

    this.excelReader.create();

    const data = await this.inventoryService.getResumeData({
      companyCode,
      inventoryId,
    });

    // filtering
    const worksheet = this.excelReader.addWorksheet(`Inventario - Resumo`);

    const stockHeaders = this.getResumeHeaders(data);
    stockHeaders.forEach(([cell, value]) => {
      this.excelReader.addData(worksheet, cell, value);
    });
    const stockValues = this.getResumeValues(data);
    stockValues.forEach(([cell, value, numFmt]) => {
      this.excelReader.addData(worksheet, cell, value);
      if (numFmt) {
        this.excelReader.addNumFmt(worksheet, cell, numFmt);
      }
    });

    return await this.excelReader.toFile();
  }
}
