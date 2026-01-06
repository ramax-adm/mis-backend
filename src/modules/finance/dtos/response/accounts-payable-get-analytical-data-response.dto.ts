import { GetAccountsPayableDataItem } from '../../types/get-accounts-payable-item.type';
import { AccountPayableTotals } from '../../types/get-accounts-payable-resume-data.type';

export class AccountsPayableGetAnalyticalDataResponse {
  totals: AccountPayableTotals;
  data: GetAccountsPayableDataItem[];

  constructor(partial: Partial<AccountsPayableGetAnalyticalDataResponse>) {
    Object.assign(this, partial);
  }
}
