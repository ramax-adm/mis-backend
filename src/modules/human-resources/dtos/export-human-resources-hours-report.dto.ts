export class ExportHumanResourcesHoursReportDto {
  filters: {
    startDate?: Date;
    endDate?: Date;
    companyCode: string;
    department?: string;
    employeeName?: string;
  };
}
