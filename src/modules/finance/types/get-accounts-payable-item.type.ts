import { AccountPayable } from '../entities/account-payable.entity';
import { AccountReceivable } from '../entities/account-receivable.entity';

export type GetAccountsPayableDataItem = AccountPayable & {
  companyName: string;
};
