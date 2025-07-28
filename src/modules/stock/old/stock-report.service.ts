import { BadRequestException, Injectable } from '@nestjs/common';
import { StockService } from './stock.service';
import { ExcelReaderService } from '@/core/services/excel-reader.service';
import { GetStockByCompanyResponseDto } from './dto/get-stock-by-company-response.dto';
import { GetToExpiresByCompanyResponseDto } from './dto/get-to-expires-by-company-response.dto';
import { GetAnalyticalToExpiresByCompanyResponseDto } from './dto/get-analytical-to-expires-by-company-response.dto';
import { GetAnalyticalStockByCompanyResponseDto } from './dto/get-analytical-stock-by-company-response.dto';
import { ExportStockReportDto } from '@/modules/stock/old/dto/export-stock-report.dto';
import { NumberUtils } from '../../utils/services/number.utils';

@Injectable()
export class StockReportService {
  constructor(
    private readonly stockService: StockService,
    private readonly excelReader: ExcelReaderService,
  ) {}

  getResumedStockDataHeaders(): [string, any][] {
    const headers: [string, any][] = [];

    // 1. Cabeçalhos de blocos de dados (linhas 1)
    headers.push(['A1', 'Estoque']);
    headers.push(['G1', 'Vencimentos (FIFO)']);

    // stock
    headers.push(['A2', 'Cod. Produto']);
    headers.push(['B2', 'Produto']);
    headers.push(['C2', 'KG']);
    headers.push(['D2', '$/KG CAR']);
    headers.push(['E2', '$/KG TRUCK']);
    headers.push(['F2', '$ Total']);

    // to expires
    headers.push(['H2', 'Cod. Produto']);
    headers.push(['I2', 'Produto']);
    headers.push(['J2', 'KG']);
    headers.push(['K2', 'Dt. Venc.']);
    headers.push(['L2', 'Prazo']);

    return headers;
  }

  getAnalyticalStockHeaders(): [string, any][] {
    const headers: [string, any][] = [
      ['A1', 'Cod. Linha'],
      ['B1', 'Linha'],
      ['C1', 'Cod. Produto'],
      ['D1', 'Produto'],
      ['E1', 'CXs'],
      ['F1', 'KG'],
      ['G1', '$ base CAR'],
      ['H1', '$ base TRUCK'],
      ['I1', '$ SP TRUCK'],
      ['J1', '$ RJ TRUCK'],
      ['K1', '$ PR TRUCK'],
      ['L1', '$ SC TRUCK'],
      ['M1', '$ MG TRUCK'],
      ['N1', '$ BA TRUCK'],
      ['O1', '$ PE TRUCK'],
      ['P1', '$ PB TRUCK'],
      ['Q1', '$ RN TRUCK'],
      ['R1', '$ GO TRUCK'],
      ['S1', '$ DF TRUCK'],
      ['T1', '$ FO TRUCK'],
      ['U1', '$ RS TRUCK'],
      ['V1', '$ MA TRUCK'],
      ['W1', '$ MT TRUCK'],
      ['X1', '$ MS TRUCK'],
      ['Y1', '$ PA TRUCK'],
      ['Z1', '$ ES TRUCK'],
      ['AA1', '$ TO TRUCK'],
      ['AB1', '$ SP CAR'],
      ['AC1', '$ RJ CAR'],
      ['AD1', '$ PR CAR'],
      ['AE1', '$ SC CAR'],
      ['AF1', '$ MG CAR'],
      ['AG1', '$ BA CAR'],
      ['AH1', '$ PE CAR'],
      ['AI1', '$ PB CAR'],
      ['AJ1', '$ RN CAR'],
      ['AK1', '$ GO CAR'],
      ['AL1', '$ DF CAR'],
      ['AM1', '$ FO CAR'],
      ['AN1', '$ RS CAR'],
      ['AO1', '$ MA CAR'],
      ['AP1', '$ MT CAR'],
      ['AQ1', '$ MS CAR'],
      ['AR1', '$ PA CAR'],
      ['AS1', '$ ES CAR'],
      ['AT1', '$ TO CAR'],
    ];

    return headers;
  }

  getAnalyticalToExpiresHeaders(): [string, any][] {
    const headers: [string, any][] = [
      ['A1', 'Cod. Linha'],
      ['B1', 'Linha'],
      ['C1', 'Cod. Produto'],
      ['D1', 'Produto'],
      ['E1', 'CXs'],
      ['F1', 'PCS'],
      ['G1', 'KGs'],
      ['H1', '$ base CAR'],
      ['I1', '$ base TRUCK'],
      ['J1', '$ total'],
      ['K1', 'Dt. Venc.'],
      ['L1', 'Prazo'],
    ];

    return headers;
  }

  getResumedStockDataValues(dto: {
    stockData: GetStockByCompanyResponseDto[];
    toExpiresData: GetToExpiresByCompanyResponseDto[];
  }): [string, any][] {
    const stockData = dto.stockData;
    const toExpiresData = dto.toExpiresData;

    const values = [];

    const row = (i: number) => i + 3;
    stockData.forEach((item, index) =>
      values.push(
        [`A${row(index)}`, item.productCode],
        [`B${row(index)}`, item.productName],
        [`C${row(index)}`, NumberUtils.nb2(item.totalWeightInKg)],
        [`D${row(index)}`, NumberUtils.nb2(item.basePriceCar)],
        [`E${row(index)}`, NumberUtils.nb2(item.basePriceTruck)],
        [`F${row(index)}`, NumberUtils.nb2(item.totalPrice)],
      ),
    );

    toExpiresData
      .sort((a, b) => a.daysToExpires - b.daysToExpires)
      .forEach((item, index) =>
        values.push(
          [`H${row(index)}`, item.productCode],
          [`I${row(index)}`, item.productName],
          [`J${row(index)}`, NumberUtils.nb2(item.totalWeightInKg)],
          [`K${row(index)}`, item.dueDate],
          [`L${row(index)}`, item.daysToExpires],
        ),
      );

    return values;
  }

  getAnalyticalStockValues(
    dto: GetAnalyticalStockByCompanyResponseDto[],
  ): [string, any][] {
    const values = [];

    const row = (i: number) => i + 2;
    dto.forEach((item, index) =>
      values.push(
        [`A${row(index)}`, item.productLineCode],
        [`B${row(index)}`, item.productLineName],
        [`C${row(index)}`, item.productCode],
        [`D${row(index)}`, item.productName],
        [`E${row(index)}`, item.boxAmount],
        [`F${row(index)}`, NumberUtils.nb2(item.totalWeightInKg)],
        [`G${row(index)}`, NumberUtils.nb2(item.basePriceCar)],
        [`H${row(index)}`, NumberUtils.nb2(item.basePriceTruck)],

        // Truck prices
        [`I${row(index)}`, NumberUtils.nb2(item.priceSPTruck)],
        [`J${row(index)}`, NumberUtils.nb2(item.priceRJTruck)],
        [`K${row(index)}`, NumberUtils.nb2(item.pricePRTruck)],
        [`L${row(index)}`, NumberUtils.nb2(item.priceSCTruck)],
        [`M${row(index)}`, NumberUtils.nb2(item.priceMGTruck)],
        [`N${row(index)}`, NumberUtils.nb2(item.priceBATruck)],
        [`O${row(index)}`, NumberUtils.nb2(item.pricePETruck)],
        [`P${row(index)}`, NumberUtils.nb2(item.pricePBTruck)],
        [`Q${row(index)}`, NumberUtils.nb2(item.priceRNTruck)],
        [`R${row(index)}`, NumberUtils.nb2(item.priceGOTruck)],
        [`S${row(index)}`, NumberUtils.nb2(item.priceDFTruck)],
        [`T${row(index)}`, NumberUtils.nb2(item.priceFOTruck)],
        [`U${row(index)}`, NumberUtils.nb2(item.priceRSTruck)],
        [`V${row(index)}`, NumberUtils.nb2(item.priceMATruck)],
        [`W${row(index)}`, NumberUtils.nb2(item.priceMTTruck)],
        [`X${row(index)}`, NumberUtils.nb2(item.priceMSTruck)],
        [`Y${row(index)}`, NumberUtils.nb2(item.pricePATruck)],
        [`Z${row(index)}`, NumberUtils.nb2(item.priceESTruck)],
        [`AA${row(index)}`, NumberUtils.nb2(item.priceTOTruck)],

        // Car prices
        [`AB${row(index)}`, NumberUtils.nb2(item.priceSPCar)],
        [`AC${row(index)}`, NumberUtils.nb2(item.priceRJCar)],
        [`AD${row(index)}`, NumberUtils.nb2(item.pricePRCar)],
        [`AE${row(index)}`, NumberUtils.nb2(item.priceSCCar)],
        [`AF${row(index)}`, NumberUtils.nb2(item.priceMGCar)],
        [`AG${row(index)}`, NumberUtils.nb2(item.priceBACar)],
        [`AH${row(index)}`, NumberUtils.nb2(item.pricePECar)],
        [`AI${row(index)}`, NumberUtils.nb2(item.pricePBCar)],
        [`AJ${row(index)}`, NumberUtils.nb2(item.priceRNCar)],
        [`AK${row(index)}`, NumberUtils.nb2(item.priceGOCar)],
        [`AL${row(index)}`, NumberUtils.nb2(item.priceDFCar)],
        [`AM${row(index)}`, NumberUtils.nb2(item.priceFOCar)],
        [`AN${row(index)}`, NumberUtils.nb2(item.priceRSCar)],
        [`AO${row(index)}`, NumberUtils.nb2(item.priceMACar)],
        [`AP${row(index)}`, NumberUtils.nb2(item.priceMTCar)],
        [`AQ${row(index)}`, NumberUtils.nb2(item.priceMSCar)],
        [`AR${row(index)}`, NumberUtils.nb2(item.pricePACar)],
        [`AS${row(index)}`, NumberUtils.nb2(item.priceESCar)],
        [`AT${row(index)}`, NumberUtils.nb2(item.priceTOCar)],
      ),
    );

    return values;
  }

  getAnalyticalToExpiresValues(
    dto: GetAnalyticalToExpiresByCompanyResponseDto[],
  ): [string, any][] {
    const values = [];

    const row = (i: number) => i + 2;
    dto
      .sort((a, b) => a.daysToExpires - b.daysToExpires)
      .forEach((item, index) =>
        values.push(
          [`A${row(index)}`, item.productLineCode],
          [`B${row(index)}`, item.productLineName],
          [`C${row(index)}`, item.productCode],
          [`D${row(index)}`, item.productName],
          [`E${row(index)}`, item.boxAmount],
          [`F${row(index)}`, item.quantity],
          [`G${row(index)}`, NumberUtils.nb2(item.totalWeightInKg)],
          [`H${row(index)}`, NumberUtils.nb2(item.basePriceCar)],
          [`I${row(index)}`, NumberUtils.nb2(item.basePriceTruck)],
          [`J${row(index)}`, NumberUtils.nb2(item.totalPrice)],
          [`K${row(index)}`, item.dueDate],
          [`L${row(index)}`, item.daysToExpires],
        ),
      );

    return values;
  }

  async exportResumed(dto: ExportStockReportDto) {
    const {
      filters: { productLineAcronyms },
    } = dto;

    this.excelReader.create();

    const stockData = await this.stockService.getResumedStockData();

    for (const data of stockData) {
      const worksheet = this.excelReader.addWorksheet(data.companyName);

      const headers = this.getResumedStockDataHeaders();
      headers.forEach(([cell, value]) => {
        this.excelReader.addData(worksheet, cell, value);
      });
      const values = this.getResumedStockDataValues({
        stockData: data.stockData.filter((item) =>
          productLineAcronyms.find(
            (i) =>
              i.companyCode == data.companyCode &&
              i.values.includes(item.productLineAcronym),
          ),
        ),
        toExpiresData: data.toExpiresData.filter((item) =>
          productLineAcronyms.find(
            (i) =>
              i.companyCode == data.companyCode &&
              i.values.includes(item.productLineAcronym),
          ),
        ),
      });
      values.forEach(([cell, value]) => {
        this.excelReader.addData(worksheet, cell, value);
      });
    }

    return await this.excelReader.toFile();
  }

  async exportAnalytical(dto: ExportStockReportDto) {
    const {
      filters: { companyCode, productLineAcronyms },
    } = dto;
    if (!companyCode || companyCode.length === 0) {
      throw new BadRequestException('Escolha uma empresa');
    }

    this.excelReader.create();

    const data = await this.stockService.getAnalyticalStockData(companyCode);

    // filtering
    const stockData = data.stockData.filter((item) =>
      productLineAcronyms.find(
        (i) =>
          i.companyCode == data.companyCode &&
          i.values.includes(item.productLineAcronym),
      ),
    );
    const toExpiresData = data.toExpiresData.filter((item) =>
      productLineAcronyms.find(
        (i) =>
          i.companyCode == data.companyCode &&
          i.values.includes(item.productLineAcronym),
      ),
    );

    // filtering
    const stockWorksheet = this.excelReader.addWorksheet(
      `Estoque - ${data.companyName}`,
    );
    const toExpiresWorksheet = this.excelReader.addWorksheet(
      `Vencimentos - ${data.companyName}`,
    );

    const stockHeaders = this.getAnalyticalStockHeaders();
    stockHeaders.forEach(([cell, value]) => {
      this.excelReader.addData(stockWorksheet, cell, value);
    });
    const stockValues = this.getAnalyticalStockValues(stockData);
    stockValues.forEach(([cell, value]) => {
      this.excelReader.addData(stockWorksheet, cell, value);
    });

    const toExpiresHeaders = this.getAnalyticalToExpiresHeaders();
    toExpiresHeaders.forEach(([cell, value]) => {
      this.excelReader.addData(toExpiresWorksheet, cell, value);
    });
    const toExpiresValues = this.getAnalyticalToExpiresValues(toExpiresData);
    toExpiresValues.forEach(([cell, value]) => {
      this.excelReader.addData(toExpiresWorksheet, cell, value);
    });

    return await this.excelReader.toFile();
  }
}
