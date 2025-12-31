export class ExportCattlePurchaseReportDto {
  filters: {
    companyCodes: string;
    startDate?: Date;
    endDate?: Date;
    cattleOwnerName?: string;
    cattleAdvisorName?: string;
    cattleClassification?: string;
    purchaseCattleOrderId?: string;
  };
}
