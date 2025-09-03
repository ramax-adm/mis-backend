import { BadRequestException, Injectable } from '@nestjs/common';
import { ExcelReaderService } from '@/core/services/excel-reader.service';
import { NumberUtils } from '../../utils/services/number.utils';
import { GetAnalyticalCattlePurchaseFreightsResponseDto } from '../dtos/get-analytical-cattle-purchase-freights-response.dto';
import { ExportCattlePurchaseFreightsReportDto } from '../dtos/export-cattle-purchase-freights-report.dto';
import { CattlePurchaseFreightService } from './cattle-purchase-freights.service';

@Injectable()
export class CattlePurchaseFreightsReportService {
  constructor(
    private readonly cattlePurchaseFreightsService: CattlePurchaseFreightService,
    private readonly excelReader: ExcelReaderService,
  ) {}

  getAnalyticalFreightsHeaders(): [string, any][] {
    const headers: [string, any][] = [
      ['A1', 'Data Abate'],
      ['B1', 'Data Recebimento'],
      ['C1', 'Dias em aberto'],
      ['D1', 'Cod. Empresa'],
      ['E1', 'Empresa'],
      ['F1', 'Cod. OC'],
      ['G1', 'Status'],
      ['H1', 'Transportadora'],
      ['I1', 'Fornecedor'],
      ['J1', 'Assessor'],
      ['K1', 'Placa'],
      ['L1', 'Frota'],
      ['M1', 'Fazenda'],
      ['N1', 'KM Propriedade'],
      ['O1', 'KM Negociado'],
      ['P1', 'Cbs'],
      ['Q1', 'R$ Asfalto'],
      ['R1', 'R$ Terra'],
      ['S1', 'R$ Base'],
      ['T1', 'R$ Tabela'],
      ['U1', 'R$ Dif'],
      ['V1', 'R$ Pedagio'],
      ['W1', 'R$ Adicional'],
      ['X1', 'R$ Desconto'],
      ['Y1', 'R$ Total'],
      ['Z1', 'NFs'],
      ['AA1', 'NFs Complementares'],
    ];

    return headers;
  }

  getAnalyticalFreightsValues(
    dto: GetAnalyticalCattlePurchaseFreightsResponseDto[],
  ): [string, any][] {
    const values = [];

    const row = (i: number) => i + 2;
    dto.forEach((item, index) =>
      values.push(
        [`A${row(index)}`, item.slaughterDate],
        [`B${row(index)}`, item.receiptDate],
        [`C${row(index)}`, item.openDays],
        [`D${row(index)}`, item.companyCode],
        [`E${row(index)}`, item.companyName],
        [`F${row(index)}`, item.purchaseCattleOrderId],
        [`G${row(index)}`, item.status],
        [`H${row(index)}`, item.freightCompanyName],
        [`I${row(index)}`, item.supplierName],
        [`J${row(index)}`, item.cattleAdvisorName],

        // Truck prices
        [`K${row(index)}`, item.freightTransportPlate],
        [`L${row(index)}`, item.freightTransportType],
        [`M${row(index)}`, item.feedlotName],
        [`N${row(index)}`, NumberUtils.nb2(item.feedlotKmDistance)],
        [`O${row(index)}`, NumberUtils.nb2(item.negotiatedKmDistance)],
        [`P${row(index)}`, NumberUtils.nb0(item.cattleQuantity)],
        [`Q${row(index)}`, NumberUtils.nb2(item.roadPrice)],
        [`R${row(index)}`, NumberUtils.nb2(item.earthPrice)],
        [`S${row(index)}`, NumberUtils.nb2(item.basePrice)],
        [`T${row(index)}`, NumberUtils.nb2(item.referenceFreightTablePrice)],
        [`U${row(index)}`, NumberUtils.nb2(item.difPrice)],
        [`V${row(index)}`, NumberUtils.nb2(item.tollPrice)],
        [`W${row(index)}`, NumberUtils.nb2(item.additionalPrice)],
        [`X${row(index)}`, NumberUtils.nb2(item.discountPrice)],
        [`Y${row(index)}`, NumberUtils.nb2(item.negotiatedFreightPrice)],
        [`Z${row(index)}`, item.entryNf],
        [`AA${row(index)}`, item.complementNf],
      ),
    );

    return values;
  }

  async exportAnalytical(dto: ExportCattlePurchaseFreightsReportDto) {
    const {
      filters: { startDate, endDate, companyCode, status, freightCompany },
    } = dto;

    const isMainFiltersChoosed = !!startDate && !!endDate && !!companyCode;
    if (!isMainFiltersChoosed) {
      throw new BadRequestException(
        'Escolha os filtros: Empresa, Dt. inicio, Dt. fim',
      );
    }

    this.excelReader.create();

    const data =
      await this.cattlePurchaseFreightsService.getAnalyticalFreightData({
        startDate,
        endDate,
        companyCode,
        status,
        freightCompany,
      });

    // filtering
    const worksheet = this.excelReader.addWorksheet(`Fretes - Analitico`);

    const freightsHeaders = this.getAnalyticalFreightsHeaders();
    freightsHeaders.forEach(([cell, value]) => {
      this.excelReader.addData(worksheet, cell, value);
    });
    const freightsValues = this.getAnalyticalFreightsValues(data);
    freightsValues.forEach(([cell, value]) => {
      this.excelReader.addData(worksheet, cell, value);
    });

    return await this.excelReader.toFile();
  }
}
