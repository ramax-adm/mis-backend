import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AccountReceivableStatusEnum } from '../enums/account-receivable-status.enum';
import { AccountReceivable } from '../entities/account-receivable.entity';
import { AccountsReceivableGetAnalyticalDataRequestDto } from '../dtos/request/accounts-receivable-get-analytical-data-request.dto';
import { NumberUtils } from '@/modules/utils/services/number.utils';
import { AccountReceivableVisualizationEnum } from '../enums/account-receivable-visualization.enum';
import { DateUtils } from '@/modules/utils/services/date.utils';
import { AccountReceivableBucketSituationEnum } from '../enums/account-receivable-bucket-situation.enum';
import { GetAccountsReceivableDataItem } from '../types/get-accounts-receivable-item.type';

@Injectable()
export class AccountsReceivableService {
  constructor(private readonly datasource: DataSource) {}

  async getData({
    startDate,
    endDate,
    companyCode,
    clientCode,
    key,
    status,
    visualizationType,
    bucketSituations,
  }: {
    // baseDate: Date;
    startDate: Date;
    endDate: Date;
    companyCode?: string;
    clientCode?: string;
    key?: string;
    status?: AccountReceivableStatusEnum;
    visualizationType?: AccountReceivableVisualizationEnum;
    bucketSituations?: AccountReceivableBucketSituationEnum[];
  }): Promise<GetAccountsReceivableDataItem[]> {
    console.log({
      startDate,
      endDate,
      companyCode,
      clientCode,
      key,
      status,
      visualizationType,
      bucketSituations,
    });

    const qb = this.datasource
      .getRepository(AccountReceivable)
      .createQueryBuilder('ar')
      .leftJoinAndSelect(
        'sensatta_companies',
        'sc',
        'sc.sensatta_code = ar.companyCode',
      )
      .where('1=1');

    if (startDate) {
      qb.andWhere('ar.issue_date >= :startDate', { startDate });
    }
    if (endDate) {
      qb.andWhere('ar.issue_date <= :endDate', { endDate });
    }
    if (companyCode) {
      qb.andWhere('ar.company_code = :companyCode', { companyCode });
    }
    if (clientCode) {
      qb.andWhere('ar.client_code = :clientCode', { clientCode });
    }
    if (key) {
      qb.andWhere('ar.key::text ILIKE :key', { key: String(`%${key}%`) });
    }
    if (status) {
      qb.andWhere('ar.status::text ILIKE :status', {
        status: `%${String(status)}%`,
      });
    }

    switch (visualizationType) {
      case AccountReceivableVisualizationEnum.VALOR_ABERTO: {
        qb.andWhere('ar.open_value > 0');
        break;
      }

      case AccountReceivableVisualizationEnum.TODOS:
      default: {
        break;
      }
    }

    const result = await qb.getRawMany();

    const response: GetAccountsReceivableDataItem[] = [];

    for (const i of result) {
      const accountReceivable = new AccountReceivable();
      accountReceivable.id = i.id;
      accountReceivable.baseDate = i.ar_base_date;
      accountReceivable.sensattaId = i.ar_sensatta_id;
      accountReceivable.key = i.ar_key;
      accountReceivable.companyCode = i.ar_company_code;
      accountReceivable.receivableNumber = i.ar_receivable_number;
      accountReceivable.issueDate = i.ar_issue_date;
      accountReceivable.dueDate = i.ar_due_date;
      accountReceivable.recognitionDate = i.ar_recognition_date;
      accountReceivable.lossRecognitionDate = i.ar_loss_recognition_date;
      accountReceivable.status = i.ar_status;
      accountReceivable.clientCode = i.ar_client_code;
      accountReceivable.clientName = i.ar_client_name;
      accountReceivable.salesRepresentativeCode =
        i.ar_sales_representative_code;
      accountReceivable.salesRepresentativeName =
        i.ar_sales_representative_name;
      accountReceivable.nfId = i.ar_nf_id;
      accountReceivable.nfNumber = i.ar_nf_number;
      accountReceivable.cfopCode = i.ar_cfop_code;
      accountReceivable.cfopDescription = i.ar_cfop_description;
      accountReceivable.accountingAccount = i.ar_accounting_account;
      accountReceivable.accountingClassification =
        i.ar_accounting_classification;
      accountReceivable.accountingAccountName = i.ar_accounting_account_name;
      accountReceivable.personType = i.ar_person_type;
      accountReceivable.currency = i.ar_currency;
      accountReceivable.value = i.ar_value;
      accountReceivable.openValue = i.ar_open_value;
      accountReceivable.sensattaCreatedBy = i.ar_sensatta_created_by;
      accountReceivable.sensattaApprovedBy = i.ar_sensatta_approved_by;
      accountReceivable.observation = i.ar_observation;
      accountReceivable.createdAt = i.ar_created_at;

      const { situation: currentBucketSituation, differenceInDays } =
        this.getBucketSituation(i.ar_base_date, i.ar_due_date);

      if (!bucketSituations.includes(currentBucketSituation)) {
        continue;
      }

      Object.assign(accountReceivable, {
        companyName: i.sc_name,
        differenceInDays,
        bucketSituation: currentBucketSituation,
      });
      response.push(accountReceivable as GetAccountsReceivableDataItem);
    }

    return response;
  }

  async getAnalyticalData(
    requestDto: AccountsReceivableGetAnalyticalDataRequestDto,
  ) {
    // data & totals
    const data = await this.getData(requestDto);

    // Total
    const totals = data.reduce(
      (acc, item) => ({
        quantity: acc.quantity + 1,
        value: NumberUtils.nb2(acc.value + item.value),
        openValue: NumberUtils.nb2(acc.openValue + item.openValue),
      }),
      {
        quantity: 0,
        value: 0,
        openValue: 0,
      },
    );

    return {
      data,
      totals,
    };
  }

  // aux
  getBucketSituation(baseDate: Date, dueDate: Date) {
    const differenceInDays = DateUtils.getDifferenceInDays(baseDate, dueDate);

    let situation;

    if (differenceInDays > 0) {
      if (differenceInDays <= 30) {
        situation = AccountReceivableBucketSituationEnum.A_VENCER_0_30;
      } else if (differenceInDays <= 60) {
        situation = AccountReceivableBucketSituationEnum.A_VENCER_31_60;
      } else if (differenceInDays <= 90) {
        situation = AccountReceivableBucketSituationEnum.A_VENCER_61_90;
      } else if (differenceInDays <= 180) {
        situation = AccountReceivableBucketSituationEnum.A_VENCER_91_180;
      } else if (differenceInDays <= 360) {
        situation = AccountReceivableBucketSituationEnum.A_VENCER_181_360;
      } else {
        situation = AccountReceivableBucketSituationEnum.A_VENCER_MAIOR_360;
      }
    } else {
      const absDays = Math.abs(differenceInDays);
      if (absDays <= 30) {
        situation = AccountReceivableBucketSituationEnum.VENCIDOS_0_30;
      } else if (absDays <= 60) {
        situation = AccountReceivableBucketSituationEnum.VENCIDOS_31_60;
      } else if (absDays <= 90) {
        situation = AccountReceivableBucketSituationEnum.VENCIDOS_61_90;
      } else if (absDays <= 180) {
        situation = AccountReceivableBucketSituationEnum.VENCIDOS_91_180;
      } else if (absDays <= 360) {
        situation = AccountReceivableBucketSituationEnum.VENCIDOS_181_360;
      } else {
        situation = AccountReceivableBucketSituationEnum.VENCIDOS_MAIOR_360;
      }
    }

    return { differenceInDays, situation };
  }
}
