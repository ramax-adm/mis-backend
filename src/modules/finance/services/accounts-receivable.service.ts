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
import { AccountsReceivableGetResumeDataRequestDto } from '../dtos/request/accounts-receivable-get-resume-data-request.dto';
import { AccountsReceivableGetResumeDataResponse } from '../dtos/response/accounts-receivable-get-resume-data-response.dto';
import {
  AccountReceivableLossByClientAgg,
  AccountReceivableOpenValueByClientAgg,
  AccountReceivableResumeAgg,
} from '../types/get-accounts-receivable-resume-data.type';
import { AccountsReceivableGetAnalyticalDataResponse } from '../dtos/response/accounts-receivable-get-analytical-data-response.dto';

@Injectable()
export class AccountsReceivableService {
  constructor(private readonly datasource: DataSource) {}

  async getData({
    startDate,
    endDate,
    companyCodes,
    clientCode,
    key,
    status,
    visualizationType,
    bucketSituations,
  }: {
    // baseDate: Date;
    startDate: Date;
    endDate: Date;
    companyCodes?: string[];
    clientCode?: string;
    key?: string;
    status?: AccountReceivableStatusEnum;
    visualizationType?: AccountReceivableVisualizationEnum;
    bucketSituations?: AccountReceivableBucketSituationEnum[];
  }): Promise<GetAccountsReceivableDataItem[]> {
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
    if (companyCodes) {
      qb.andWhere('ar.company_code IN (:...companyCodes)', { companyCodes });
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
      Object.assign(accountReceivable, {
        companyName: i.sc_name,
      });

      const { situation: currentBucketSituation, differenceInDays } =
        this.getBucketSituation(i.ar_base_date, i.ar_due_date);

      if (!bucketSituations?.includes(currentBucketSituation)) {
        continue;
      }
      Object.assign(accountReceivable, {
        differenceInDays,
        bucketSituation: currentBucketSituation,
      });

      response.push(accountReceivable as GetAccountsReceivableDataItem);
    }

    return response;
  }

  /* o que interessa: titulos vencidos, titulos com valor aberto, perda de titulos */
  // bucket vencido p/ situsção
  /**
   * totais:{
   * quantidade: number,
   * valor: number
   * valorAberto: number
   * }
   *
   * ==========================================================
   * ANALISES GERAIS
   * listagemPorSituacao: map<situacao,array<accountReceivable>
   * listagemPorEmpresa: map<empresa,array<accountReceivable>
   * listagemPorCliente: map<cliente,array<accountReceivable>
   *
   * mapPorCliente: map<cliente,{
   * quantidade: number,
   * valor: number
   * valorAberto: number
   * %:number
   * % do total: number
   * }>
   *
   * mapPorEmpresa: map<empresa,{
   * quantidade: number,
   * valor: number
   * valorAberto: number
   * %:number
   * % do total: number
   * }>
   *
   * mapPorSituacao: map<situacao,{
   * quantidade: number,
   * valor: number
   * valorAberto: number
   * %:number
   * % do total: number
   * }>
   *
   * ==========================================================
   * ANALISES P/ CLIENTE
   * mapValorAbertoPorCliente: map<cliente, {
   * quantidade: number,
   * valor: number
   * valorAbertoAVencer: number
   * valorAbertoAVencido: number
   * %:number
   * }>
   *
   * mapTitulosPerdaCliente: map<cliente, {
   * quantidade: number,
   * valor: number
   * %:number
   * >
   */

  async getResumeData(requestDto: AccountsReceivableGetResumeDataRequestDto) {
    // 1️⃣ Buscar dados usando o método já existente
    const BUCKET_SITUATIONS_ALL = [
      AccountReceivableBucketSituationEnum.VENCIDOS_0_30,
      AccountReceivableBucketSituationEnum.VENCIDOS_31_60,
      AccountReceivableBucketSituationEnum.VENCIDOS_61_90,
      AccountReceivableBucketSituationEnum.VENCIDOS_91_180,
      AccountReceivableBucketSituationEnum.VENCIDOS_181_360,
      AccountReceivableBucketSituationEnum.VENCIDOS_MAIOR_360,
      AccountReceivableBucketSituationEnum.A_VENCER_0_30,
      AccountReceivableBucketSituationEnum.A_VENCER_31_60,
      AccountReceivableBucketSituationEnum.A_VENCER_61_90,
      AccountReceivableBucketSituationEnum.A_VENCER_91_180,
      AccountReceivableBucketSituationEnum.A_VENCER_181_360,
      AccountReceivableBucketSituationEnum.A_VENCER_MAIOR_360,
    ];
    const data = await this.getData({
      ...requestDto,
      bucketSituations: BUCKET_SITUATIONS_ALL,
    });

    // 3️⃣ Totais gerais
    const totals = this.getTotals(data);

    // ===============================
    // ANALISES GERAIS
    // ===============================
    const listByStatus = new Map<string, GetAccountsReceivableDataItem[]>();
    const listByBucketSituation = new Map<
      string,
      GetAccountsReceivableDataItem[]
    >(BUCKET_SITUATIONS_ALL.map((i) => [i, []]));
    const listByCompany = new Map<string, GetAccountsReceivableDataItem[]>();
    const listByClient = new Map<string, GetAccountsReceivableDataItem[]>();

    const mapByStatus = new Map<string, AccountReceivableResumeAgg>();
    const mapByBucketSituation = new Map<string, AccountReceivableResumeAgg>(
      BUCKET_SITUATIONS_ALL.map((i) => [
        i,
        { quantity: 0, value: 0, openValue: 0, percent: 0, totalPercent: 0 },
      ]),
    );
    const mapByCompany = new Map<string, AccountReceivableResumeAgg>();
    const mapByClient = new Map<string, AccountReceivableResumeAgg>();

    for (const item of data) {
      const status = `${item.status}`;
      const situation = `${item.bucketSituation}`;
      const company = `${item.companyCode} - ${item.companyName}`;
      const client = `${item.clientCode} - ${item.clientName}`;

      if (!listByStatus.has(status)) listByStatus.set(status, []);
      if (!listByBucketSituation.has(situation))
        listByBucketSituation.set(situation, []);
      if (!listByCompany.has(company)) listByCompany.set(company, []);
      if (!listByClient.has(client)) listByClient.set(client, []);

      listByStatus.get(status).push(item);
      listByBucketSituation.get(situation).push(item);
      listByCompany.get(company).push(item);
      listByClient.get(client).push(item);

      if (!mapByStatus.has(status))
        mapByStatus.set(status, {
          quantity: 0,
          value: 0,
          openValue: 0,
          percent: 0,
          totalPercent: 0,
        });
      if (!mapByCompany.has(company))
        mapByCompany.set(company, {
          quantity: 0,
          value: 0,
          openValue: 0,
          percent: 0,
          totalPercent: 0,
        });
      if (!mapByBucketSituation.has(situation))
        mapByBucketSituation.set(situation, {
          quantity: 0,
          value: 0,
          openValue: 0,
          percent: 0,
          totalPercent: 0,
        });
      if (!mapByClient.has(client))
        mapByClient.set(client, {
          quantity: 0,
          value: 0,
          openValue: 0,
          percent: 0,
          totalPercent: 0,
        });

      const previousStatusMap = mapByStatus.get(status);
      previousStatusMap.quantity += 1;
      previousStatusMap.value += item.value || 0;
      previousStatusMap.openValue += item.openValue || 0;

      const previousBucketSituationMap = mapByBucketSituation.get(situation);
      previousBucketSituationMap.quantity += 1;
      previousBucketSituationMap.value += item.value || 0;
      previousBucketSituationMap.openValue += item.openValue || 0;

      const previousCompanyMap = mapByCompany.get(company);
      previousCompanyMap.quantity += 1;
      previousCompanyMap.value += item.value || 0;
      previousCompanyMap.openValue += item.openValue || 0;
      const previousClientMap = mapByClient.get(client);
      previousClientMap.quantity += 1;
      previousClientMap.value += item.value || 0;
      previousClientMap.openValue += item.openValue || 0;
    }

    mapByStatus.forEach((value) => {
      value.percent = NumberUtils.nb4(value.value / totals.value);
    });
    mapByBucketSituation.forEach((value) => {
      value.percent = NumberUtils.nb4(value.value / totals.value);
    });
    mapByCompany.forEach((value) => {
      value.percent = NumberUtils.nb4(value.value / totals.value);
    });
    mapByClient.forEach((value) => {
      value.percent = NumberUtils.nb4(value.value / totals.value);
    });

    // ===============================
    // ANALISES POR CLIENTE
    // ===============================
    const mapOpenValueByClient = new Map<
      string,
      AccountReceivableOpenValueByClientAgg
    >();
    const mapLossByClient = new Map<string, AccountReceivableLossByClientAgg>();

    // open titles
    const openTitles = data.filter((i) => i.openValue && i.openValue > 0);
    for (const item of openTitles) {
      const client = `${item.clientCode} - ${item.clientName}`;
      const openToExpire =
        item.status === AccountReceivableStatusEnum.A_VENCER
          ? item.openValue
          : 0;
      const openExpired =
        item.status === AccountReceivableStatusEnum.VENCIDO
          ? item.openValue
          : 0;

      if (!mapOpenValueByClient.has(client)) {
        const group = {
          quantity: 0,
          value: 0,
          openValueToExpire: 0,
          openValueExpired: 0,
          percentage: 0,
        };
        mapOpenValueByClient.set(client, group);
      }

      const previousMap = mapOpenValueByClient.get(client);
      previousMap.quantity += 1;
      previousMap.value += item.value || 0;
      previousMap.openValueToExpire += openToExpire || 0;
      previousMap.openValueExpired += openExpired || 0;
    }

    // loss titles
    const lossTitles = data.filter((i) => i.lossRecognitionDate);
    for (const item of lossTitles) {
      const client = `${item.clientCode} - ${item.clientName}`;
      const group = {
        quantity: 0,
        value: 0,
        percentage: 0,
      };
      if (!mapLossByClient.has(client)) mapLossByClient.set(client, group);

      const previousMap = mapLossByClient.get(client);
      previousMap.quantity += 1;
      previousMap.value += item.value || 0;
    }

    mapOpenValueByClient.forEach((value) => {
      value.percentage = NumberUtils.nb4(value.value / totals.value);
    });
    mapLossByClient.forEach((value) => {
      value.percentage = NumberUtils.nb4(value.value / totals.value);
    });

    return new AccountsReceivableGetResumeDataResponse({
      totals,
      listByStatus: Object.fromEntries(listByStatus),
      listByBucketSituation: Object.fromEntries(listByBucketSituation),
      listByCompany: Object.fromEntries(listByCompany),
      listByClient: Object.fromEntries(listByClient),
      accountReceivableByClient: Object.fromEntries(mapByClient),
      accountReceivableByCompany: Object.fromEntries(mapByCompany),
      accountReceivableByStatus: Object.fromEntries(mapByStatus),
      accountReceivableByBucketSituation:
        Object.fromEntries(mapByBucketSituation),
      openValueByClient: Object.fromEntries(mapOpenValueByClient),
      lossByClient: Object.fromEntries(mapLossByClient),
    });
  }

  async getAnalyticalData(
    requestDto: AccountsReceivableGetAnalyticalDataRequestDto,
  ) {
    const data = await this.getData(requestDto);
    const totals = this.getTotals(data);

    return new AccountsReceivableGetAnalyticalDataResponse({
      data,
      totals,
    });
  }

  // aux
  private getTotals(data: GetAccountsReceivableDataItem[]) {
    return data.reduce(
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
  }

  private getBucketSituation(baseDate: Date, dueDate: Date) {
    const differenceInDays = DateUtils.getDifferenceInDays(baseDate, dueDate);

    let situation: AccountReceivableBucketSituationEnum;
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
