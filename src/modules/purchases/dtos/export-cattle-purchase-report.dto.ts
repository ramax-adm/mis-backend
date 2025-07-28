export class ExportCattlePurchaseReportDto {
  filters: {
    companyCode: string;
    startDate?: Date;
    endDate?: Date;
    cattleOwnerName?: string;
    cattleAdvisorName?: string;
    cattleClassification?: string;
  };
}
