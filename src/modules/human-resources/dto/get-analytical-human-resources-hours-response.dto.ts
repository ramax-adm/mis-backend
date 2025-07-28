import { DateUtils } from '@/modules/utils/services/date.utils';
import * as dateFns from 'date-fns';

export interface GetAnalyticalHumanResourcesHoursResponseInput {
  id: string;
  date: Date;
  integrationSystem: string;
  companyCode: string;
  companyName: string;
  payrollNumber: string;
  employeeName: string;
  department: string;
  normalHours: string;
  hoursOff: string;
  absenceHours: string;
  halfExtraHours: string;
  fullExtraHours: string;
  createdAt: Date;
}

export class GetAnalyticalHumanResourcesHoursResponseDto {
  date: Date;
  integrationSystem: string;
  companyCode: string;
  companyName: string;
  payrollNumber: string;
  employeeName: string;
  department: string;
  normalHours: string;
  hoursOff: string;
  absenceHours: string;
  halfExtraHours: string;
  fullExtraHours: string;
  createdAt: Date;

  constructor(data: GetAnalyticalHumanResourcesHoursResponseInput) {
    Object.assign(this, {
      date: data.date,
      integrationSystem: data.integrationSystem,
      companyCode: data.companyCode,
      companyName: data.companyName,
      payrollNumber: data.payrollNumber,
      employeeName: data.employeeName,
      department: data.department,
      normalHours: data.normalHours,
      hoursOff: data.hoursOff,
      absenceHours: data.absenceHours,
      halfExtraHours: data.halfExtraHours,
      fullExtraHours: data.fullExtraHours,
      createdAt: data.createdAt,
    });
  }

  static create(data: GetAnalyticalHumanResourcesHoursResponseInput) {
    return new GetAnalyticalHumanResourcesHoursResponseDto(data);
  }

  toJSON() {
    const parsedDate = dateFns.addHours(this.date, 3);
    const isNormalHoursNegative = this.normalHours.startsWith('-');
    const isHoursOffNegative = this.hoursOff.startsWith('-');
    const isAbsenceHoursNegative = this.absenceHours.startsWith('-');
    const isHalfExtraHoursNegative = this.halfExtraHours.startsWith('-');
    const isFullExtraHoursNegative = this.fullExtraHours.startsWith('-');
    return {
      date: DateUtils.format(parsedDate, 'date'),
      integrationSystem: this.integrationSystem,
      companyCode: this.companyCode,
      companyName: this.companyName,
      payrollNumber: this.payrollNumber,
      employeeName: this.employeeName,
      department: this.department,
      normalHours: this.normalHours.slice(0, isNormalHoursNegative ? 6 : 5),
      hoursOff: this.hoursOff.slice(0, isHoursOffNegative ? 6 : 5),
      absenceHours: this.absenceHours.slice(0, isAbsenceHoursNegative ? 6 : 5),
      halfExtraHours: this.halfExtraHours.slice(
        0,
        isHalfExtraHoursNegative ? 6 : 5,
      ),
      fullExtraHours: this.fullExtraHours.slice(
        0,
        isFullExtraHoursNegative ? 6 : 5,
      ),
      extraHours: this.fullExtraHours.slice(
        0,
        isFullExtraHoursNegative ? 6 : 5,
      ),
    };
  }
}
