import { BadRequestException, Injectable } from '@nestjs/common';
import { StockService } from './stock.service';
import { ExcelReaderService } from '@/common/services/excel-reader.service';
import { GetStockByCompanyResponseDto } from './dto/get-stock-by-company-response.dto';
import { GetToExpiresByCompanyResponseDto } from './dto/get-to-expires-by-company-response.dto';
import { GetAnalyticalToExpiresByCompanyResponseDto } from './dto/get-analytical-to-expires-by-company-response.dto';
import { GetAnalyticalStockByCompanyResponseDto } from './dto/get-analytical-stock-by-company-response.dto';
import { ExportStockReportDto } from '@/services/stock/dto/export-stock-report.dto';

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
    headers.push(['D2', 'R$/KG']);
    headers.push(['E2', 'R$ Total']);

    // to expires
    headers.push(['G2', 'Cod. Produto']);
    headers.push(['H2', 'Produto']);
    headers.push(['I2', 'KG']);
    headers.push(['J2', 'Dt. Venc.']);
    headers.push(['K2', 'Prazo']);

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
      ['G1', 'R$/KG base'],
      ['H1', 'R$/KG SP TRUCK'],
      ['I1', 'R$/KG RJ TRUCK'],
      ['J1', 'R$/KG PR TRUCK'],
      ['K1', 'R$/KG SC TRUCK'],
      ['L1', 'R$/KG MG TRUCK'],
      ['M1', 'R$/KG BA TRUCK'],
      ['N1', 'R$/KG PE TRUCK'],
      ['O1', 'R$/KG PB TRUCK'],
      ['P1', 'R$/KG RN TRUCK'],
      ['Q1', 'R$/KG GO TRUCK'],
      ['R1', 'R$/KG DF TRUCK'],
      ['S1', 'R$/KG FO TRUCK'],
      ['T1', 'R$/KG RS TRUCK'],
      ['U1', 'R$/KG MA TRUCK'],
      ['V1', 'R$/KG MT TRUCK'],
      ['W1', 'R$/KG MS TRUCK'],
      ['X1', 'R$/KG PA TRUCK'],
      ['Y1', 'R$/KG ES TRUCK'],
      ['Z1', 'R$/KG TO TRUCK'],
      ['AA1', 'R$/KG SP CAR'],
      ['AB1', 'R$/KG RJ CAR'],
      ['AC1', 'R$/KG PR CAR'],
      ['AD1', 'R$/KG SC CAR'],
      ['AE1', 'R$/KG MG CAR'],
      ['AF1', 'R$/KG BA CAR'],
      ['AG1', 'R$/KG PE CAR'],
      ['AH1', 'R$/KG PB CAR'],
      ['AI1', 'R$/KG RN CAR'],
      ['AJ1', 'R$/KG GO CAR'],
      ['AK1', 'R$/KG DF CAR'],
      ['AL1', 'R$/KG FO CAR'],
      ['AM1', 'R$/KG RS CAR'],
      ['AN1', 'R$/KG MA CAR'],
      ['AO1', 'R$/KG MT CAR'],
      ['AP1', 'R$/KG MS CAR'],
      ['AQ1', 'R$/KG PA CAR'],
      ['AR1', 'R$/KG ES CAR'],
      ['AS1', 'R$/KG TO CAR'],
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
      ['H1', 'R$/KG base'],
      ['I1', 'R$/KG total'],
      ['J1', 'Dt. Venc.'],
      ['K1', 'Prazo'],
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
        [`C${row(index)}`, item.totalWeightInKg],
        [`D${row(index)}`, item.basePrice],
        [`E${row(index)}`, item.totalPrice],
      ),
    );

    toExpiresData.forEach((item, index) =>
      values.push(
        [`G${row(index)}`, item.productCode],
        [`H${row(index)}`, item.productName],
        [`I${row(index)}`, item.totalWeightInKg],
        [`J${row(index)}`, item.dueDate],
        [`K${row(index)}`, item.daysToExpires],
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
        [`F${row(index)}`, item.totalWeightInKg],
        [`G${row(index)}`, item.basePrice],

        // Truck prices
        [`H${row(index)}`, item.priceSPTruck],
        [`I${row(index)}`, item.priceRJTruck],
        [`J${row(index)}`, item.pricePRTruck],
        [`K${row(index)}`, item.priceSCTruck],
        [`L${row(index)}`, item.priceMGTruck],
        [`M${row(index)}`, item.priceBATruck],
        [`N${row(index)}`, item.pricePETruck],
        [`O${row(index)}`, item.pricePBTruck],
        [`P${row(index)}`, item.priceRNTruck],
        [`Q${row(index)}`, item.priceGOTruck],
        [`R${row(index)}`, item.priceDFTruck],
        [`S${row(index)}`, item.priceFOTruck],
        [`T${row(index)}`, item.priceRSTruck],
        [`U${row(index)}`, item.priceMATruck],
        [`V${row(index)}`, item.priceMTTruck],
        [`W${row(index)}`, item.priceMSTruck],
        [`X${row(index)}`, item.pricePATruck],
        [`Y${row(index)}`, item.priceESTruck],
        [`Z${row(index)}`, item.priceTOTruck],

        // Car prices
        [`AA${row(index)}`, item.priceSPCar],
        [`AB${row(index)}`, item.priceRJCar],
        [`AC${row(index)}`, item.pricePRCar],
        [`AD${row(index)}`, item.priceSCCar],
        [`AE${row(index)}`, item.priceMGCar],
        [`AF${row(index)}`, item.priceBACar],
        [`AG${row(index)}`, item.pricePECar],
        [`AH${row(index)}`, item.pricePBCar],
        [`AI${row(index)}`, item.priceRNCar],
        [`AJ${row(index)}`, item.priceGOCar],
        [`AK${row(index)}`, item.priceDFCar],
        [`AL${row(index)}`, item.priceFOCar],
        [`AM${row(index)}`, item.priceRSCar],
        [`AN${row(index)}`, item.priceMACar],
        [`AO${row(index)}`, item.priceMTCar],
        [`AP${row(index)}`, item.priceMSCar],
        [`AQ${row(index)}`, item.pricePACar],
        [`AR${row(index)}`, item.priceESCar],
        [`AS${row(index)}`, item.priceTOCar],
      ),
    );

    return values;
  }

  getAnalyticalToExpiresValues(
    dto: GetAnalyticalToExpiresByCompanyResponseDto[],
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
        [`F${row(index)}`, item.quantity],
        [`G${row(index)}`, item.totalWeightInKg],
        [`H${row(index)}`, item.basePrice],
        [`I${row(index)}`, item.totalPrice],
        [`J${row(index)}`, item.dueDate],
        [`K${row(index)}`, item.daysToExpires],
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
