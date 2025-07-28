import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ExcelReaderService,
  NumFormats,
} from '@/core/services/excel-reader.service';
import { HumanResourcesHoursService } from './human-resources-hours.service';
import { GetAnalyticalHumanResourcesHoursResponseDto } from './dto/get-analytical-human-resources-hours-response.dto';
import { ExportHumanResourcesHoursReportDto } from './dto/export-human-resources-hours-report.dto';
import { DateUtils } from '../utils/services/date.utils';
import { ExcelUtils } from '../utils/services/excel.utils';

@Injectable()
export class HumanResourcesHoursReportService {
  constructor(
    private readonly humanResourcesHoursService: HumanResourcesHoursService,
    private readonly excelReader: ExcelReaderService,
  ) {}

  getAnalyticalHeaders(): [string, any][] {
    const headers: [string, any][] = [
      ['A1', 'Data'],
      ['B1', 'Cod. Empresa'],
      ['C1', 'Empresa'],
      ['D1', 'Funcionario'],
      ['E1', 'Departamento'],
      ['F1', 'Hs. Normais'],
      ['G1', 'Hs. Extras'],
      ['H1', 'Hs. Folgas'],
      ['I1', 'Hs. Faltas'],
    ];

    return headers;
  }

  getAnalyticalValues(
    dto: GetAnalyticalHumanResourcesHoursResponseDto[],
  ): [string, any, NumFormats | undefined][] {
    const values = [];

    const row = (i: number) => i + 2;

    dto.forEach((item, index) => {
      const isNormalHoursNegative = item.normalHours.startsWith('-');
      const isFullExtraHoursNegative = item.fullExtraHours.startsWith('-');
      const isHoursOffNegative = item.hoursOff.startsWith('-');
      const isAbsenceHoursNegative = item.absenceHours.startsWith('-');

      const excelNormalHours = isNormalHoursNegative
        ? item.normalHours
        : ExcelUtils.timeStringToExcelNumber(item.normalHours);
      const excelNormalHoursNumFmt = isNormalHoursNegative
        ? NumFormats.TEXT
        : NumFormats.HOURS;

      const excelFullExtraHours = isFullExtraHoursNegative
        ? item.fullExtraHours
        : ExcelUtils.timeStringToExcelNumber(item.fullExtraHours);
      const excelFullExtraHoursNumFmt = isFullExtraHoursNegative
        ? NumFormats.TEXT
        : NumFormats.HOURS;

      const excelHoursOff = isHoursOffNegative
        ? item.hoursOff
        : ExcelUtils.timeStringToExcelNumber(item.hoursOff);
      const excelHoursOffNumFmt = isHoursOffNegative
        ? NumFormats.TEXT
        : NumFormats.HOURS;

      const excelAbsenceHours = isAbsenceHoursNegative
        ? item.absenceHours
        : ExcelUtils.timeStringToExcelNumber(item.absenceHours);
      const excelAbsenceHoursNumFmt = isAbsenceHoursNegative
        ? NumFormats.TEXT
        : NumFormats.HOURS;

      values.push(
        [`A${row(index)}`, DateUtils.format(item.date, 'date')],
        [`B${row(index)}`, item.companyCode],
        [`C${row(index)}`, item.companyName],
        [`D${row(index)}`, item.employeeName],
        [`E${row(index)}`, item.department],
        [`F${row(index)}`, excelNormalHours, excelNormalHoursNumFmt],
        [`G${row(index)}`, excelFullExtraHours, excelFullExtraHoursNumFmt],
        [`H${row(index)}`, excelHoursOff, excelHoursOffNumFmt],
        [`I${row(index)}`, excelAbsenceHours, excelAbsenceHoursNumFmt],
      );
    });

    return values;
  }

  async exportAnalytical(dto: ExportHumanResourcesHoursReportDto) {
    const {
      filters: { startDate, endDate, companyCode, department, employeeName },
    } = dto;

    const isMainFiltersChoosed = !!startDate && !!endDate && !!companyCode;
    if (!isMainFiltersChoosed) {
      throw new BadRequestException(
        'Escolha os filtros: Empresa, Dt. inicio, Dt. fim',
      );
    }

    this.excelReader.create();

    const data = await this.humanResourcesHoursService.getAnalyticalData({
      startDate,
      endDate,
      companyCode,
      department,
      employeeName,
    });

    // filtering
    const worksheet = this.excelReader.addWorksheet(`Horas Extras - Analitico`);

    const extraHoursHeaders = this.getAnalyticalHeaders();
    extraHoursHeaders.forEach(([cell, value]) => {
      this.excelReader.addData(worksheet, cell, value);
    });
    const extraHoursValues = this.getAnalyticalValues(data);
    extraHoursValues.forEach(([cell, value, numFmt]) => {
      this.excelReader.addData(worksheet, cell, value);
      if (numFmt) {
        this.excelReader.addNumFmt(worksheet, cell, numFmt);
      }
    });

    return await this.excelReader.toFile();
  }
}
