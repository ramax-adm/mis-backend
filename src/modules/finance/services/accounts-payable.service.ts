import { NumberUtils } from '@/modules/utils/services/number.utils';
import { AccountPayable } from '../entities/account-payable.entity';
import { GetAccountsPayableDataItem } from '../types/get-accounts-payable-item.type';
import { AccountsPayableGetAnalyticalDataResponse } from '../dtos/response/accounts-payable-get-analytical-data-response.dto';
import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { AccountsPayableGetAnalyticalDataRequestDto } from '../dtos/request/accounts-payable-get-analytical-data-request.dto';

@Injectable()
export class AccountsPayableService {
  constructor(private readonly datasource: DataSource) {}

  async getData({
    startDate,
    endDate,
    companyCodes,
  }: {
    // baseDate: Date;
    startDate: Date;
    endDate: Date;
    companyCodes?: string[];
  }): Promise<any[]> {
    const qb = this.datasource
      .getRepository(AccountPayable)
      .createQueryBuilder('ap')
      .leftJoinAndSelect(
        'sensatta_companies',
        'sc',
        'sc.sensatta_code = ap.companyCode',
      )
      .where('1=1');

    if (startDate) {
      qb.andWhere('ap.issue_date >= :startDate', { startDate });
    }
    if (endDate) {
      qb.andWhere('ap.issue_date <= :endDate', { endDate });
    }
    if (companyCodes) {
      qb.andWhere('ap.company_code IN (:...companyCodes)', { companyCodes });
    }

    const result = await qb.getRawMany();

    const response: GetAccountsPayableDataItem[] = [];

    for (const i of result) {
      const accountPayable = new AccountPayable();
      accountPayable.id = i.id;
      accountPayable.baseDate = i.ap_base_date;
      accountPayable.sensattaId = i.ap_sensatta_id;
      accountPayable.key = i.ap_key;
      accountPayable.companyCode = i.ap_company_code;
      accountPayable.paymentNumber = i.ap_payment_number;

      accountPayable.issueDate = i.ap_issue_date;
      accountPayable.dueDate = i.ap_due_date;
      accountPayable.liquidationDate = i.ap_liquidation_date;

      accountPayable.status = i.ap_status;
      accountPayable.supplyCode = i.ap_supply_code;
      accountPayable.supplyName = i.ap_supply_name;
      accountPayable.recognitionTypeCode = i.ap_recognition_type_code;
      accountPayable.recognitionType = i.ap_recognition_type;
      accountPayable.accountingAccount = i.ap_accounting_account;
      accountPayable.accountingClassification = i.ap_accounting_classification;
      accountPayable.accountingAccountName = i.ap_accounting_account_name;
      accountPayable.clientCode = i.ap_client_code;
      accountPayable.clientName = i.ap_client_name;
      accountPayable.salesRepresentativeCode = i.ap_sales_representative_code;
      accountPayable.salesRepresentativeName = i.ap_sales_representative_name;
      accountPayable.nfId = i.ap_nf_id;
      accountPayable.nfNumber = i.ap_nf_number;
      accountPayable.cfopCode = i.ap_cfop_code;
      accountPayable.cfopDescription = i.ap_cfop_description;
      accountPayable.currency = i.ap_currency;
      accountPayable.value = i.ap_value;
      accountPayable.payedValue = i.ap_payed_value;
      accountPayable.additionalValue = i.ap_additional_value;

      accountPayable.sensattaCreatedBy = i.ap_sensatta_created_by;
      accountPayable.sensattaViewedBy = i.ap_sensatta_viewed_by;
      accountPayable.sensattaApprovedBy = i.ap_sensatta_approved_by;
      accountPayable.sensattaLiquidatedBy = i.ap_sensatta_liquidated_by;
      accountPayable.observation = i.ap_observation;
      accountPayable.createdAt = i.ap_created_at;
      Object.assign(accountPayable, {
        companyName: i.sc_name,
      });

      response.push(accountPayable as GetAccountsPayableDataItem);
    }

    return response;
  }
  async getAnalyticalData(
    requestDto: AccountsPayableGetAnalyticalDataRequestDto,
  ) {
    const data = await this.getData(requestDto);
    const totals = this.getTotals(data);

    return new AccountsPayableGetAnalyticalDataResponse({
      data,
      totals,
    });
  }

  private getTotals(data: GetAccountsPayableDataItem[]) {
    return data.reduce(
      (acc, item) => ({
        quantity: acc.quantity + 1,
        value: NumberUtils.nb2(acc.value + item.value),
      }),
      {
        quantity: 0,
        value: 0,
      },
    );
  }
}
