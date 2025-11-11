import { GetAccountsReceivableDataItem } from '../../types/get-accounts-receivable-item.type';
import {
  AccountReceivableLossByClientAgg,
  AccountReceivableOpenValueByClientAgg,
  AccountReceivableResumeAgg,
  AccountReceivableResumeTotals,
} from '../../types/get-accounts-receivable-resume-data.type';

export class AccountsReceivableGetResumeDataResponse {
  totals: AccountReceivableResumeTotals;
  listByStatus: Record<string, GetAccountsReceivableDataItem[]>;
  listByBucketSituation: Record<string, GetAccountsReceivableDataItem[]>;
  listByCompany: Record<string, GetAccountsReceivableDataItem[]>;
  listByClient: Record<string, GetAccountsReceivableDataItem[]>;
  accountReceivableByStatus: Record<string, AccountReceivableResumeAgg>;
  accountReceivableByCompany: Record<string, AccountReceivableResumeAgg>;
  accountReceivableByBucketSituation: Record<
    string,
    AccountReceivableResumeAgg
  >;
  accountReceivableByClient: Record<string, AccountReceivableResumeAgg>;
  openValueByClient: Record<string, AccountReceivableOpenValueByClientAgg>;
  lossByClient: Record<string, AccountReceivableLossByClientAgg>;

  constructor(partial: Partial<AccountsReceivableGetResumeDataResponse>) {
    Object.assign(this, partial);
  }
}
