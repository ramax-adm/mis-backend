import { AccountReceivable } from '../entities/account-receivable.entity';

export type GetAccountsReceivableDataItem = AccountReceivable & {
  companyName: string;
  differenceInDays: number;
  bucketSituation: string;
};
