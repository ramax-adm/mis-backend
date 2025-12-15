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
import { TempHistoricoRefaturamento } from '@/core/entities/temp/temp-historico-refaturamento.entity';
import { GetReinvoicingHistoryItem } from '../types/get-reinvoicing-history.type';

@Injectable()
export class BusinessAuditSalesReportService {
  constructor(
    private readonly businessAuditSalesService: BusinessAuditSalesService,
    private readonly excelReader: ExcelReaderService,
  ) {}

  // GET HEADERS
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
      ['T1', 'KGs'],
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

  /**
   * VENDA ORIGINAL																					  						
     Emp	Dt	NF	Cat	Cliente	Produto	KG 1 $ Venda 	 $ Tab 	 $ Fat 	 $tab 	 $ Desc 
     
     REFATURAMENTO
     Dt	NF	Cat	Cliente	KG	 $ Venda 	 $ Fat 	 $tab 	 $ Desc 	 	
     
     DIFERENÇAS
     Dias 	 KG 	 $ Venda 	 Fat 	% Fat	Motivo	OBS
   */

  getReinvoicingHistoryHeaders() {
    const headers: [string, any][] = [
      ['A1', 'Venda Original'],
      ['A2', 'Emp'],
      ['B2', 'Dt.'],
      ['C2', 'NF'],
      ['D2', 'Cliente'],
      ['E2', 'Categoria'],
      ['F2', 'Produto'],
      ['G2', 'KG'],
      ['H2', '$ Venda Un.'],
      ['I2', '$ Tab Un.'],
      ['J2', '$ Fat'],
      ['K2', '$ Tab'],
      ['L2', '$ Desc'],

      ['M1', 'Refaturamento'],
      ['M2', 'Dt.'],
      ['N2', 'NF'],
      ['O2', 'Categoria'],
      ['P2', 'Produto'],
      ['Q2', 'Cliente'],
      ['R2', 'KG'],
      ['S2', '$ Venda Un.'],
      ['T2', '$ Fat'],
      ['U2', '$ Tab'],
      ['V2', '$ Desc'],

      ['W1', 'Diferenças'],
      ['W2', 'Dias'],
      ['X2', 'KG'],
      ['Y2', '$ Venda Un.'],
      ['Z2', '$ Fat'],
      ['AA2', '% Fat'],
      ['AB2', 'B.O'],
      ['AC2', 'Tipo BO'],
      ['AD2', 'N° Refat'],
      ['AE2', 'Motivo'],
      ['AF2', 'Obs'],
    ];

    return headers;
  }

  // GET VALUES
  getSalesByInvoiceValues(
    dto: GetBusinessAuditSalesDataResponseDto['salesByInvoice'],
  ): [string, any, NumFormats | undefined][] {
    const values = [];

    const row = (i: number) => i + 2;

    const data = Object.values(dto.data);

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
        [`T${row(index)}`, NumberUtils.nb4(item.totalKg)],
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

      const difPercent =
        totalTableValue === 0
          ? 0
          : NumberUtils.nb4(item.totalValue / totalTableValue - 1);
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
        [`AB${row(index)}`, NumberUtils.nb4(difPercent)],
      );
    });

    return values;
  }

  getReinvoicingHistoryValues2(dto: GetReinvoicingHistoryItem[]) {
    const values = [];
    const row = (i: number) => i + 3; // começa da linha 3 (linha 1 e 2 = headers)

    dto.forEach((item, index) => {
      // constants
      const formatedDate = DateUtils.formatFromIso(item.date, 'date');

      // Mutable variables
      let reinvoicingDate = null;
      let reinvoicingProduct = null;
      let reinvoicingClient = null;
      let reinvoicingWeightInKg = 0;

      if (item.aggDateReinvoicing) {
        reinvoicingDate = DateUtils.formatFromIso(
          item.aggDateReinvoicing,
          'date',
        );
      } else if (item.reInvoicingDate) {
        reinvoicingDate = DateUtils.formatFromIso(item.reInvoicingDate, 'date');
      }

      if (item.aggProductReinvoicing) {
        reinvoicingProduct = `${item.aggProductReinvoicing}; Total KG: ${item.aggWeightInKgReinvoicing}`;
      } else if (item.reInvoicingProductCode) {
        reinvoicingProduct = `${item.reInvoicingProductCode} - ${item.reInvoicingProductName}`;
      }

      if (item.reInvoicingClientCode) {
        reinvoicingClient = `${item.reInvoicingClientCode} - ${item.reInvoicingClientName}`;
      }

      if (item.aggWeightInKgReinvoicing) {
        reinvoicingWeightInKg = item.aggWeightInKgReinvoicing;
      } else if (item.reInvoicingWeightInKg) {
        reinvoicingWeightInKg = item.reInvoicingWeightInKg;
      }

      values.push(
        // VENDA ORIGINAL
        [`A${row(index)}`, item.companyCode],
        [`B${row(index)}`, formatedDate],
        [`C${row(index)}`, item.nfNumber],
        [`D${row(index)}`, `${item.clientCode} - ${item.clientName}`],
        [`E${row(index)}`, item.category],
        [`F${row(index)}`, `${item.productCode} - ${item.productName}`],
        [`G${row(index)}`, NumberUtils.nb2(item.weightInKg ?? 0)],
        [`H${row(index)}`, NumberUtils.nb2(item.saleUnitPrice ?? 0)],
        [`I${row(index)}`, NumberUtils.nb2(item.tableUnitPrice ?? 0)],
        [`J${row(index)}`, NumberUtils.nb2(item.invoicingValue ?? 0)],
        [`K${row(index)}`, NumberUtils.nb2(item.tableValue ?? 0)],
        [`K${row(index)}`, NumberUtils.nb2(item.tableValue ?? 0)],
        [`L${row(index)}`, item.invoicingValue - item.tableValue],

        // REFATURAMENTO
        [`M${row(index)}`, reinvoicingDate],
        [`N${row(index)}`, item.reInvoicingNfNumber],
        [`O${row(index)}`, item.reInvoicingCategory],
        [`P${row(index)}`, reinvoicingProduct],
        [`Q${row(index)}`, reinvoicingClient],
        [`R${row(index)}`, NumberUtils.nb2(reinvoicingWeightInKg)],
        [`S${row(index)}`, NumberUtils.nb2(item.reInvoicingUnitPrice ?? 0)],
        [`T${row(index)}`, NumberUtils.nb2(item.reInvoicingValue ?? 0)],
        [`U${row(index)}`, NumberUtils.nb2(item.reInvoicingTableValue ?? 0)],
        [`V${row(index)}`, item.reInvoicingValue - item.reInvoicingTableValue],

        // DIFERENÇAS
        [`W${row(index)}`, item.difDays],
        [
          `X${row(index)}`,
          NumberUtils.nb2(item.difWeightInKgProportional ?? 0),
        ],
        [`Y${row(index)}`, NumberUtils.nb2(item.difSaleUnitPrice ?? 0)], // unidade
        [`Z${row(index)}`, NumberUtils.nb2(item.difValue ?? 0)],
        [`AA${row(index)}`, NumberUtils.nb4(item.difValuePercent ?? 0)],
        [`AB${row(index)}`, item.occurrenceNumber],
        [`AC${row(index)}`, item.returnType],
        [`AD${row(index)}`, item.reinvoicingSequence],
        [`AE${row(index)}`, item.occurrenceCause],
        [`AF${row(index)}`, item.observation],
      );
    });

    return values;
  }

  getReinvoicingHistoryValues(dto: GetReinvoicingHistoryItem[]) {
    const values = [];
    const row = (i: number) => i + 3; // começa da linha 3 (linha 1 e 2 = headers)

    dto
      .filter((item) => item.reInvoicingProductCode)
      .forEach((item, index) => {
        // constants
        const formatedDate = DateUtils.formatFromIso(item.date, 'date');

        // Mutable variables
        let reinvoicingDate = null;
        let reinvoicingProduct = null;
        let reinvoicingClient = null;
        let reinvoicingWeightInKg = 0;

        if (item.aggDateReinvoicing) {
          reinvoicingDate = DateUtils.formatFromIso(
            item.aggDateReinvoicing,
            'date',
          );
        } else if (item.reInvoicingDate) {
          reinvoicingDate = DateUtils.formatFromIso(
            item.reInvoicingDate,
            'date',
          );
        }

        if (item.aggProductReinvoicing) {
          reinvoicingProduct = `${item.aggProductReinvoicing}; Total KG: ${item.aggWeightInKgReinvoicing}`;
        } else if (item.reInvoicingProductCode) {
          reinvoicingProduct = `${item.reInvoicingProductCode} - ${item.reInvoicingProductName}`;
        }

        if (item.reInvoicingClientCode) {
          reinvoicingClient = `${item.reInvoicingClientCode} - ${item.reInvoicingClientName}`;
        }

        if (item.aggWeightInKgReinvoicing) {
          reinvoicingWeightInKg = item.aggWeightInKgReinvoicing;
        } else if (item.reInvoicingWeightInKg) {
          reinvoicingWeightInKg = item.reInvoicingWeightInKg;
        }

        values.push(
          // VENDA ORIGINAL
          [`A${row(index)}`, item.companyCode],
          [`B${row(index)}`, formatedDate],
          [`C${row(index)}`, item.nfNumber],
          [`D${row(index)}`, `${item.clientCode} - ${item.clientName}`],
          [`E${row(index)}`, item.category],
          [`F${row(index)}`, `${item.productCode} - ${item.productName}`],
          [`G${row(index)}`, NumberUtils.nb2(item.weightInKg ?? 0)],
          [`H${row(index)}`, NumberUtils.nb2(item.saleUnitPrice ?? 0)],
          [`I${row(index)}`, NumberUtils.nb2(item.tableUnitPrice ?? 0)],
          [`J${row(index)}`, NumberUtils.nb2(item.invoicingValue ?? 0)],
          [`K${row(index)}`, NumberUtils.nb2(item.tableValue ?? 0)],
          [`L${row(index)}`, item.invoicingValue - item.tableValue],

          // REFATURAMENTO
          [`M${row(index)}`, reinvoicingDate],
          [`N${row(index)}`, item.reInvoicingNfNumber],
          [`O${row(index)}`, item.reInvoicingCategory],
          [`P${row(index)}`, reinvoicingProduct],
          [`Q${row(index)}`, reinvoicingClient],
          [`R${row(index)}`, NumberUtils.nb2(reinvoicingWeightInKg)],
          [`S${row(index)}`, NumberUtils.nb2(item.reInvoicingUnitPrice ?? 0)],
          [`T${row(index)}`, NumberUtils.nb2(item.reInvoicingValue ?? 0)],
          [`U${row(index)}`, NumberUtils.nb2(item.reInvoicingTableValue ?? 0)],
          [
            `V${row(index)}`,
            item.reInvoicingValue - item.reInvoicingTableValue,
          ],

          // DIFERENÇAS
          [`W${row(index)}`, item.difDays],
          [
            `X${row(index)}`,
            NumberUtils.nb2(item.difWeightInKgProportional ?? 0),
          ],
          [`Y${row(index)}`, NumberUtils.nb2(item.difSaleUnitPrice ?? 0)], // unidade
          [`Z${row(index)}`, NumberUtils.nb2(item.difValue ?? 0)],
          [`AA${row(index)}`, NumberUtils.nb4(item.difValuePercent ?? 0)],
          [`AB${row(index)}`, item.occurrenceNumber],
          [`AC${row(index)}`, item.returnType],
          [`AD${row(index)}`, item.reinvoicingSequence],
          [`AE${row(index)}`, item.occurrenceCause],
          [`AF${row(index)}`, item.observation],
        );
      });

    return values;
  }

  // PROCESS REPORT
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

    const reinvoicingHistoryData =
      await this.businessAuditSalesService.getReinvoicingHistory({
        startDate,
        endDate,
        companyCodes: companyCodes?.split(','),
        market,
        priceConsideration,
        clientCodes: clientCodes?.split(','),
        salesRepresentativeCodes: salesRepresentativeCodes?.split(','),
      });

    const worksheet = this.excelReader.addWorksheet(
      `Monitoramento - Vendas por NF`,
    );
    const orderLinesWorksheet = this.excelReader.addWorksheet(
      `Monitoramento - Itens NF`,
    );
    const reinvoicingHistoryWorksheet = this.excelReader.addWorksheet(
      `Monitoramento - Fat x Refat`,
    );
    const reinvoicingHistoryWorksheet2 = this.excelReader.addWorksheet(
      `Monitoramento - Fat x Refat(2)`,
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

    const reinvoicingHistoryHeaders = this.getReinvoicingHistoryHeaders();
    reinvoicingHistoryHeaders.forEach(([cell, value]) => {
      this.excelReader.addData(reinvoicingHistoryWorksheet, cell, value);
      this.excelReader.addData(reinvoicingHistoryWorksheet2, cell, value);
    });

    const reinvoicingHistoryValues = this.getReinvoicingHistoryValues(
      reinvoicingHistoryData,
    );
    reinvoicingHistoryValues.forEach(([cell, value, numFmt]) => {
      this.excelReader.addData(reinvoicingHistoryWorksheet, cell, value);
      if (numFmt) {
        this.excelReader.addNumFmt(reinvoicingHistoryWorksheet, cell, numFmt);
      }
    });
    const reinvoicingHistoryValues2 = this.getReinvoicingHistoryValues2(
      reinvoicingHistoryData,
    );
    reinvoicingHistoryValues2.forEach(([cell, value, numFmt]) => {
      this.excelReader.addData(reinvoicingHistoryWorksheet2, cell, value);
      if (numFmt) {
        this.excelReader.addNumFmt(reinvoicingHistoryWorksheet2, cell, numFmt);
      }
    });

    return await this.excelReader.toFile();
  }

  // AUX
  private getMarket(market: string) {
    const marketMap = {
      [MarketEnum.ME]: 'ME',
      [MarketEnum.MI]: 'MI',
    };

    return marketMap[market];
  }
}
