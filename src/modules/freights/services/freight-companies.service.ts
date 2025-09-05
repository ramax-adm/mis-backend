import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { AnttFreightCompaniesConsultation } from '../entities/antt-freight-companies-consultations.entity';
import { FreightCompany } from '@/core/entities/sensatta/freight-company.entity';
import { FreightCompanyStatusEnum } from '../enums/freight-company-status.enum';
import { GetFreightCompanyRawItem } from '../types/freight-companies.types';

@Injectable()
export class FreightCompaniesService {
  constructor(private readonly datasource: DataSource) {}

  /***
   * data:{
   *    sensatta_code,
   *    name,
   *    cnpj,
   *    rnrtc_code,
   *    rnrtc_status,
   *    registered_at,
   *    location,
   *    result_status,
   *    result_description,
   *    result_observation
   * }
   * kpis:{
   * quantity_status_ok
   * quantity_status_error
   * status_by_day
   * }
   *
   */

  async findOne(sensattaCode: string) {
    const consultations = await this.datasource
      .getRepository(AnttFreightCompaniesConsultation)
      .find({
        where: { sensattaCode },
      });

    const qb = this.datasource
      .getRepository(FreightCompany) // dev.sensatta_freight_companies
      .createQueryBuilder('sfc');

    // subquery: última data por sensatta_code (não referencia sfc)
    qb.leftJoin(
      'antt_freight_companies_consultations',
      'afcc',
      `afcc.sensatta_code = sfc.sensatta_code
     AND afcc."date" = (
        SELECT MAX(sub."date")
        FROM dev.antt_freight_companies_consultations sub
        WHERE sub.sensatta_code = sfc.sensatta_code
     )`,
    ).select([
      'sfc.sensatta_code as sensatta_code',
      'sfc.name as name',
      'sfc.cnpj as cnpj',
      'afcc.rnrtc_code as rnrtc_code',
      'afcc.rnrtc_status as rnrtc_status',
      'afcc.registered_at as registered_at',
      'afcc.location as location',
      'afcc.result_status as result_status',
      'afcc.result_description as result_description',
      'afcc.result_observation as result_observation',
      'afcc.created_at as verified_at',
    ]);
    qb.where('sfc.sensatta_code = :sensattaCode', { sensattaCode });

    const freightCompany = await qb.getRawOne();

    const kpis = {
      quantityStatusOk: 0,
      quantityStatusError: 0,
      statusByDay: new Map<string, string>(),
    };

    for (const consultation of consultations) {
      const dateKey = consultation.date.toString();
      const resultStatus = consultation.resultStatus;

      if (!kpis.statusByDay.has(dateKey)) {
        kpis.statusByDay.set(dateKey, '');
      }

      if (resultStatus === FreightCompanyStatusEnum.OK) {
        kpis.statusByDay.set(dateKey, FreightCompanyStatusEnum.OK);
        kpis.quantityStatusOk += 1;
      } else if (resultStatus === FreightCompanyStatusEnum.NAO_CONFORME) {
        kpis.statusByDay.set(dateKey, FreightCompanyStatusEnum.NAO_CONFORME);
        kpis.quantityStatusError += 1;
      }
    }

    return {
      freightCompany: {
        sensattaCode: freightCompany.sensatta_code,
        name: freightCompany.name,
        cnpj: freightCompany.cnpj,
        rnrtcCode: freightCompany.rnrtc_code,
        rnrtcStatus: freightCompany.rnrtc_status,
        registeredAt: freightCompany.registered_at,
        location: freightCompany.location,
        resultStatus: freightCompany.result_status,
        resultDescription: freightCompany.result_description,
        resultObservation: freightCompany.result_observation,
        verifiedAt: freightCompany.verified_at,
      },
      kpis: {
        quantityStatusOk: kpis.quantityStatusOk,
        quantityStatusError: kpis.quantityStatusError,
        statusByDay: Object.fromEntries(kpis.statusByDay),
      },
    };
  }

  /**
   * Listagem de empresas com status ANTT
        ).length,
        quantityStatusError: consultations.filter(
          (c) => c.resultStatus === FreightCompanyStatusEnum.NAO_CONFORME,
        ).length,
      },
    };
  }

  /**
   * Listagem de empresas com status ANTT
   */
  async findAll() {
    const qb = this.datasource
      .getRepository(FreightCompany) // dev.sensatta_freight_companies
      .createQueryBuilder('sfc');

    // subquery: última data por sensatta_code (não referencia sfc)
    qb.leftJoin(
      'antt_freight_companies_consultations',
      'afcc',
      `afcc.sensatta_code = sfc.sensatta_code
     AND afcc."date" = (
        SELECT MAX(sub."date")
        FROM dev.antt_freight_companies_consultations sub
        WHERE sub.sensatta_code = sfc.sensatta_code
     )`,
    ).select([
      'sfc.sensatta_code as sensatta_code',
      'sfc.name as name',
      'sfc.cnpj as cnpj',
      'sfc.state_subscription as state_subscription',
      'sfc.city as city',
      'sfc.uf as uf',
      'afcc.rnrtc_code as rnrtc_code',
      'afcc.result_status as result_status',
      'afcc.created_at as verified_at',
    ]);
    const data = await qb.getRawMany<GetFreightCompanyRawItem>();

    const result = data.map((item) => ({
      sensattaCode: item.sensatta_code,
      name: item.name,
      cnpj: item.cnpj,
      stateSubscription: item.state_subscription,
      city: item.city,
      uf: item.uf,
      rnrtcCode: item.rnrtc_code,
      resultStatus: item.result_status || 'ERRO CONSULTA',
      verifiedAt: item.verified_at,
    }));
    return result;
  }
}
