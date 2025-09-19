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
import { MarketEnum } from '@/core/enums/sensatta/markets.enum';

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
      ['H1', 'Cod CFOP'],
      ['I1', 'CFOP'],
      ['J1', 'Cliente'],
      ['K1', 'Representante'],
      ['L1', 'Prazo'],
      ['M1', '$ Faturamento'],
      ['N1', '$ Tabela'],
      ['O1', '$ Desc'],
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
      ['H1', 'Cod CFOP'],
      ['I1', 'CFOP'],
      ['J1', 'Cod. Cliente'],
      ['K1', 'Cliente'],
      ['L1', 'Cod. Representante'],
      ['M1', 'Representante'],
      ['N1', 'Prazo'],
      ['O1', 'Cod. Produto'],
      ['P1', 'Produto'],
      ['Q1', 'Qtd.'],
      ['R1', 'Peso KG'],
      ['S1', 'Moeda'],
      ['T1', 'Preço Un.'],
      ['U1', 'Preço Tabela Un.'],
      ['V1', 'Valor Total NF'],
      ['W1', 'Valor Total Tabela'],
      ['X1', 'Desc.'],
    ];

    return headers;
  }

  getSalesByInvoiceValues(
    dto: GetBusinessAuditSalesDataResponseDto['salesByInvoice'],
  ): [string, any, NumFormats | undefined][] {
    const values = [];

    const row = (i: number) => i + 2;

    const data = Object.values(dto.data);

    data.forEach((item, index) => {
      values.push(
        [`A${row(index)}`, DateUtils.format(item.date, 'date')],
        [`B${row(index)}`, item.companyCode],
        [`C${row(index)}`, item.companyName],
        [`D${row(index)}`, this.getMarket(item.market)],
        [`E${row(index)}`, item.orderNumber],
        [`F${row(index)}`, item.nfNumber],
        [`G${row(index)}`, item.salesCount],
        [`H${row(index)}`, item.cfopCode],
        [`I${row(index)}`, item.cfopDescription],
        [`J${row(index)}`, item.clientName],
        [`K${row(index)}`, item.representativeName],
        [`L${row(index)}`, item.paymentTerm],
        [`M${row(index)}`, NumberUtils.nb2(item.totalFatValue)],
        [`N${row(index)}`, NumberUtils.nb2(item.totalTableValue)],
        [`O${row(index)}`, NumberUtils.nb2(item.totalDiff)],
      );
    });

    return values;
  }
  getOrderLinesValues(
    dto: OrderLine[],
  ): [string, any, NumFormats | undefined][] {
    const values = [];

    const row = (i: number) => i + 2; // começa da linha 2 (linha 1 = header)

    dto.forEach((item, index) => {
      const totalTableValue =
        (item.referenceTableUnitValue || 0) * (item.weightInKg || 0);
      values.push(
        [`A${row(index)}`, DateUtils.format(item.billingDate, 'date')],
        [`B${row(index)}`, item.companyCode],
        [`C${row(index)}`, item.companyName],
        [`D${row(index)}`, this.getMarket(item.market)],
        [`E${row(index)}`, item.orderId],
        [`F${row(index)}`, item.nfNumber],
        [`G${row(index)}`, item.situation],
        [`H${row(index)}`, item.cfopCode],
        [`I${row(index)}`, item.cfopDescription],
        [`J${row(index)}`, item.clientCode],
        [`K${row(index)}`, item.clientName],
        [`L${row(index)}`, item.salesRepresentativeCode],
        [`M${row(index)}`, item.salesRepresentativeName],
        [`N${row(index)}`, item.paymentTerm],
        [`O${row(index)}`, item.productCode],
        [`P${row(index)}`, item.productName],
        [`Q${row(index)}`, NumberUtils.nb2(item.quantity ?? 0)],
        [`R${row(index)}`, NumberUtils.nb2(item.weightInKg ?? 0)],
        [`S${row(index)}`, item.currency],
        [`T${row(index)}`, NumberUtils.nb2(item.saleUnitValue ?? 0)],
        [`U${row(index)}`, NumberUtils.nb2(item.referenceTableUnitValue ?? 0)],
        [`V${row(index)}`, NumberUtils.nb2(item.totalValue ?? 0)],
        [`W${row(index)}`, NumberUtils.nb2(totalTableValue)],
        [`X${row(index)}`, NumberUtils.nb2(item.totalValue - totalTableValue)],
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
        clientCode,
        salesRepresentativeCode,
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
      companyCodes: companyCodes.split(','),
      market,
      priceConsideration,
      clientCode,
      salesRepresentativeCode,
    });

    const orderLinesData = await this.businessAuditSalesService.getOrdersLines({
      startDate,
      endDate,
      companyCodes: companyCodes.split(','),
      market,
      priceConsideration,
      clientCode,
      salesRepresentativeCode,
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
