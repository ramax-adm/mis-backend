export class ExportCattlePurchaseFreightsReportDto {
  filters: {
    startDate?: Date;
    endDate?: Date;
    companyCode: string;
    status?: string;
    freightCompany?: string;
  };
}
