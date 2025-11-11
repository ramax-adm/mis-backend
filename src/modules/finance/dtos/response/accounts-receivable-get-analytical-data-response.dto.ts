import { GetAccountsReceivableDataItem } from '../../types/get-accounts-receivable-item.type';
import { AccountReceivableResumeTotals } from '../../types/get-accounts-receivable-resume-data.type';

export class AccountsReceivableGetAnalyticalDataResponse {
  totals: AccountReceivableResumeTotals;
  data: GetAccountsReceivableDataItem[];

  constructor(partial: Partial<AccountsReceivableGetAnalyticalDataResponse>) {
    Object.assign(this, partial);
  }
}
