import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ExcelReaderService,
  NumFormats,
} from '@/core/services/excel-reader.service';
import { DateUtils } from '../../utils/services/date.utils';
import { BusinessAuditOverviewService } from './business-audit-overview.service';
import { GetBusinessAuditSalesDataResponseDto } from '../dtos/response/get-business-sales-data-response.dto';
import { BusinessAuditSalesService } from './business-audit-sales.service';
import { ExportBusinessAuditReportDto } from '../dtos/request/export-business-audit-report-request.dto';
import { NumberUtils } from '@/modules/utils/services/number.utils';
import { GetBusinessSalesOrderLinesResponseDto } from '../dtos/response/get-business-sales-order-lines-response.dto';
import { OrderLine } from '@/modules/sales/entities/order-line.entity';
import { MarketEnum } from '@/modules/stock/enums/markets.enum';
import { GetOrderLineItem } from '../types/get-order-line.type';

@Injectable()
export class BusinessAuditSalesReportService {
  constructor(
    private readonly businessAuditSalesService: BusinessAuditSalesService,
    private readonly excelReader: ExcelReaderService,
  ) {}

  private getMarket(market: string) {
    const marketMap = {
      [MarketEnum.ME]: 'ME',
      [MarketEnum.MI]: 'MI',
    };

    return marketMap[market];
  }

  getSalesByInvoiceHeaders(): [string, any][] {
    const headers: [string, any][] = [
      ['A1', 'Data Faturamento'],
      ['B1', 'Cod. Empresa'],
      ['C1', 'Empresa'],
      ['D1', 'Mercado'],
      ['E1', 'N° Pedido'],
      ['F1', 'N° NF'],
      ['G1', 'Qtd. Itens NF'],
      ['H1', 'Categoria'],
      ['I1', 'Cod CFOP'],
      ['J1', 'CFOP'],
      ['K1', 'Cliente'],
      ['L1', 'Cidade'],
      ['M1', 'UF'],
      ['N1', 'Representante'],
      ['O1', 'Prazo'],
      ['P1', '$ Faturamento'],
      ['Q1', '$ Tabela'],
      ['R1', '$ Dif'],
      ['S1', '% Dif'],
    ];

    return headers;
  }

  getOrderLinesHeaders(): [string, any][] {
    const headers: [string, any][] = [
      ['A1', 'Data Faturamento'],
      ['B1', 'Cod. Empresa'],
      ['C1', 'Empresa'],
      ['D1', 'Mercado'],
      ['E1', 'N° Pedido'],
      ['F1', 'N° NF'],
      ['G1', 'Situação'],
      ['H1', 'Categoria'],
      ['I1', 'Cod CFOP'],
      ['J1', 'CFOP'],
      ['K1', 'Cod. Cliente'],
      ['L1', 'Cliente'],
      ['M1', 'Cidade'],
      ['N1', 'UF'],
      ['O1', 'Cod. Representante'],
      ['P1', 'Representante'],
      ['Q1', 'Prazo'],
      ['R1', 'Cod. Produto'],
      ['S1', 'Produto'],
      ['T1', 'Qtd.'],
      ['U1', 'Peso KG'],
      ['V1', 'Moeda'],
      ['W1', 'Preço Un.'],
      ['X1', 'Preço Tabela Un.'],
      ['Y1', 'Valor Total NF'],
      ['Z1', 'Valor Total Tabela'],
      ['AA1', 'Dif.'],
      ['AB1', '% Dif.'],
    ];

    return headers;
  }

  getSalesByInvoiceValues(
    dto: GetBusinessAuditSalesDataResponseDto['salesByInvoice'],
  ): [string, any, NumFormats | undefined][] {
    const values = [];

    const row = (i: number) => i + 2;

    const data = Object.values(dto.data);

    console.log('date', data[0].date);

    data.forEach((item, index) => {
      values.push(
        [`A${row(index)}`, DateUtils.formatFromIso(item.date, 'date')],
        [`B${row(index)}`, item.companyCode],
        [`C${row(index)}`, item.companyName],
        [`D${row(index)}`, this.getMarket(item.market)],
        [`E${row(index)}`, item.orderNumber],
        [`F${row(index)}`, item.nfNumber],
        [`G${row(index)}`, item.salesCount],
        [`H${row(index)}`, item.orderCategory],
        [`I${row(index)}`, item.cfopCode],
        [`J${row(index)}`, item.cfopDescription],
        [`K${row(index)}`, item.clientName],
        [`L${row(index)}`, item.city],
        [`M${row(index)}`, item.uf],
        [`N${row(index)}`, item.representativeName],
        [`O${row(index)}`, item.paymentTerm],
        [`P${row(index)}`, NumberUtils.nb2(item.totalFatValue)],
        [`Q${row(index)}`, NumberUtils.nb2(item.totalTableValue)],
        [`R${row(index)}`, NumberUtils.nb2(item.totalDiff)],
        [`S${row(index)}`, NumberUtils.nb4(item.totalDiffPercent) || 0],
      );
    });

    return values;
  }
  getOrderLinesValues(
    dto: GetOrderLineItem[],
  ): [string, any, NumFormats | undefined][] {
    const values = [];

    const row = (i: number) => i + 2; // começa da linha 2 (linha 1 = header)

    dto.forEach((item, index) => {
      const totalTableValue =
        (item.referenceTableUnitValue || 0) * (item.weightInKg || 0);
      values.push(
        [`A${row(index)}`, DateUtils.formatFromIso(item.billingDate, 'date')],
        [`B${row(index)}`, item.companyCode],
        [`C${row(index)}`, item.companyName],
        [`D${row(index)}`, this.getMarket(item.market)],
        [`E${row(index)}`, item.orderId],
        [`F${row(index)}`, item.nfNumber],
        [`G${row(index)}`, item.situation],
        [`H${row(index)}`, item.category],
        [`I${row(index)}`, item.cfopCode],
        [`J${row(index)}`, item.cfopDescription],
        [`K${row(index)}`, item.clientCode],
        [`L${row(index)}`, item.clientName],
        [`M${row(index)}`, item.city],
        [`N${row(index)}`, item.uf],
        [`O${row(index)}`, item.salesRepresentativeCode],
        [`P${row(index)}`, item.salesRepresentativeName],
        [`Q${row(index)}`, item.paymentTerm],
        [`R${row(index)}`, item.productCode],
        [`S${row(index)}`, item.productName],
        [`T${row(index)}`, NumberUtils.nb2(item.quantity ?? 0)],
        [`U${row(index)}`, NumberUtils.nb2(item.weightInKg ?? 0)],
        [`V${row(index)}`, item.currency],
        [`W${row(index)}`, NumberUtils.nb2(item.saleUnitValue ?? 0)],
        [`X${row(index)}`, NumberUtils.nb2(item.referenceTableUnitValue ?? 0)],
        [`Y${row(index)}`, NumberUtils.nb2(item.totalValue ?? 0)],
        [`Z${row(index)}`, NumberUtils.nb2(totalTableValue)],
        [`AA${row(index)}`, NumberUtils.nb2(item.totalValue - totalTableValue)],

        [
          `AB${row(index)}`,
          NumberUtils.nb4(1 - item.totalValue / (totalTableValue || 1)),
        ],
      );
    });

    return values;
  }

  async exportSalesByInvoice(dto: ExportBusinessAuditReportDto) {
    const {
      filters: {
        startDate,
        endDate,
        companyCodes,
        market,
        priceConsideration,
        clientCodes,
        salesRepresentativeCodes,
      },
    } = dto;

    const isMainFiltersChoosed = !!startDate && !!endDate;
    if (!isMainFiltersChoosed) {
      throw new BadRequestException('Escolha os filtros:Dt. inicio, Dt. fim');
    }

    this.excelReader.create();

    const data = await this.businessAuditSalesService.getSalesAuditData({
      startDate,
      endDate,
      companyCodes: companyCodes?.split(','),
      market,
      priceConsideration,
      clientCodes: clientCodes?.split(','),
      salesRepresentativeCodes: salesRepresentativeCodes?.split(','),
    });

    const orderLinesData = await this.businessAuditSalesService.getOrdersLines({
      startDate,
      endDate,
      companyCodes: companyCodes?.split(','),
      market,
      priceConsideration,
      clientCodes: clientCodes?.split(','),
      salesRepresentativeCodes: salesRepresentativeCodes?.split(','),
    });

    // filtering
    const worksheet = this.excelReader.addWorksheet(
      `Monitoramento - Vendas por NF`,
    );
    const orderLinesWorksheet = this.excelReader.addWorksheet(
      `Monitoramento - Itens NF`,
    );

    const salesByInvoiceHeaders = this.getSalesByInvoiceHeaders();
    salesByInvoiceHeaders.forEach(([cell, value]) => {
      this.excelReader.addData(worksheet, cell, value);
    });
    const salesByInvoiceValues = this.getSalesByInvoiceValues(
      data.salesByInvoice,
    );
    salesByInvoiceValues.forEach(([cell, value, numFmt]) => {
      this.excelReader.addData(worksheet, cell, value);
      if (numFmt) {
        this.excelReader.addNumFmt(worksheet, cell, numFmt);
      }
    });

    const orderLinesHeaders = this.getOrderLinesHeaders();
    orderLinesHeaders.forEach(([cell, value]) => {
      this.excelReader.addData(orderLinesWorksheet, cell, value);
    });
    const orderLinesValues = this.getOrderLinesValues(orderLinesData);
    orderLinesValues.forEach(([cell, value, numFmt]) => {
      this.excelReader.addData(orderLinesWorksheet, cell, value);
      if (numFmt) {
        this.excelReader.addNumFmt(orderLinesWorksheet, cell, numFmt);
      }
    });

    return await this.excelReader.toFile();
  }
}
