import { AccountReceivableBucketSituationEnum } from '../../enums/account-receivable-bucket-situation.enum';
import { AccountReceivableStatusEnum } from '../../enums/account-receivable-status.enum';
import { AccountReceivableVisualizationEnum } from '../../enums/account-receivable-visualization.enum';

export class ExportAccountsReceivablesReportDto {
  filters: {
    startDate: Date;
    endDate: Date;
    companyCode?: string;
    clientCode?: string;
    key?: string;
    status?: AccountReceivableStatusEnum;
    visualizationType?: AccountReceivableVisualizationEnum;
    bucketSituations?: string;
  };
}
