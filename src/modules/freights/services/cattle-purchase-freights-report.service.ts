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
      ['A1', 'Data'],
      ['B1', 'Cod. Empresa'],
      ['C1', 'Empresa'],
      ['D1', 'Cod. OC'],
      ['E1', 'Status'],
      ['F1', 'Transportadora'],
      ['G1', 'Fornecedor'],
      ['H1', 'Assessor'],
      ['I1', 'Placa'],
      ['J1', 'Frota'],
      ['K1', 'Fazenda'],
      ['L1', 'KM Propriedade'],
      ['M1', 'KM Negociado'],
      ['N1', 'Cbs'],
      ['O1', 'R$ Tabela'],
      ['P1', 'R$ Frete'],
      ['Q1', 'R$ Dif'],
      ['R1', 'R$/KM'],
      ['S1', 'R$/KM/CBS'],
      ['T1', 'NFs'],
      ['U1', 'NFs Complementares'],
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
        [`B${row(index)}`, item.companyCode],
        [`C${row(index)}`, item.companyName],
        [`D${row(index)}`, item.purchaseCattleOrderId],
        [`E${row(index)}`, item.status],
        [`F${row(index)}`, item.freightCompanyName],
        [`G${row(index)}`, item.supplierName],
        [`H${row(index)}`, item.cattleAdvisorName],

        // Truck prices
        [`I${row(index)}`, item.freightTransportPlate],
        [`J${row(index)}`, item.freightTransportType],
        [`K${row(index)}`, item.feedlotName],
        [`L${row(index)}`, NumberUtils.nb2(item.feedlotKmDistance)],
        [`M${row(index)}`, NumberUtils.nb2(item.negotiatedKmDistance)],
        [`N${row(index)}`, NumberUtils.nb0(item.cattleQuantity)],
        [`O${row(index)}`, NumberUtils.nb2(item.referenceFreightTablePrice)],
        [`P${row(index)}`, NumberUtils.nb2(item.negotiatedFreightPrice)],
        [`Q${row(index)}`, NumberUtils.nb2(item.difPrice)],
        [`R${row(index)}`, NumberUtils.nb2(item.priceKm)],
        [`S${row(index)}`, NumberUtils.nb2(item.priceKmCattleQuantity)],
        [`T${row(index)}`, item.entryNf],
        [`U${row(index)}`, item.complementNf],
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
