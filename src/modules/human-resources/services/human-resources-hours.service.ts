import { ExternalHumanResourcesHours } from '@/core/entities/external/external-human-resources-hours.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Between,
  DataSource,
  FindOptionsWhere,
  ILike,
  LessThanOrEqual,
  MoreThanOrEqual,
} from 'typeorm';
import { GetAnalyticalHumanResourcesHoursResponseDto } from '../dtos/get-analytical-human-resources-hours-response.dto';
import { DateUtils } from '../../utils/services/date.utils';
import { StringUtils } from '../../utils/services/string.utils';
import { GetHumanResourcesHoursLastUpdatedAtResponseDto } from '../dtos/get-human-resources-hours-last-updated-at-response.dto';
import { Company } from '@/core/entities/sensatta/company.entity';
import * as dateFns from 'date-fns';

const TWO_HOURS_IN_SECONDS = 2 * 60 * 60;
const TWELVE_HOURS_IN_SECONDS = 12 * 60 * 60;

@Injectable()
export class HumanResourcesHoursService {
  constructor(private readonly datasource: DataSource) {}

  async getLastUpdatedAt() {
    const [freight] = await this.datasource.manager.find(
      ExternalHumanResourcesHours,
      {
        order: {
          createdAt: 'desc',
        },
        take: 1,
      },
    );

    // Toda vez que eu atualizo os dados (dou carga novamente) o dado é recriado
    return {
      updatedAt: freight.createdAt,
    } as GetHumanResourcesHoursLastUpdatedAtResponseDto;
  }

  async getData(companyCode: string) {
    return await this.datasource.manager.find(ExternalHumanResourcesHours, {
      where: {
        companyCode,
      },
      order: {
        date: 'ASC',
      },
    });
  }

  async getAnalyticalData({
    startDate,
    endDate,
    companyCode,
    employeeName = '',
    department = '',
  }: {
    startDate?: Date;
    endDate?: Date;
    companyCode?: string;
    employeeName?: string;
    department?: string;
  }) {
    const where: FindOptionsWhere<ExternalHumanResourcesHours> = {};

    if (companyCode) {
      where.companyCode = companyCode;
    }

    if (employeeName) {
      where.employeeName = ILike(`%${employeeName}%`);
    }

    if (department) {
      where.department = ILike(`%${department}%`);
    }

    if (startDate && endDate) {
      where.date = Between(startDate, endDate);
    } else if (startDate) {
      where.date = MoreThanOrEqual(startDate);
    } else if (endDate) {
      where.date = LessThanOrEqual(endDate);
    }

    const company = await this.datasource.manager.findOne(Company, {
      where: { sensattaCode: companyCode },
    });
    if (!company) {
      throw new NotFoundException(
        'Não foi possivel localizar a empresa em questão',
      );
    }

    const data = await this.datasource.manager.find(
      ExternalHumanResourcesHours,
      {
        where,
        order: {
          date: 'desc',
        },
      },
    );

    const response = data.map((item) =>
      GetAnalyticalHumanResourcesHoursResponseDto.create({
        ...item,
        companyName: company.name,
      }),
    );

    return response;
  }

  async getResumeData({
    startDate,
    endDate,
    companyCode,
    employeeName = '',
    department = '',
  }: {
    startDate?: Date;
    endDate?: Date;
    companyCode?: string;
    employeeName?: string;
    department?: string;
  }) {
    const data = await this.datasource.manager.find(
      ExternalHumanResourcesHours,
      {
        where: {
          companyCode,
        },
        order: {
          date: 'ASC',
        },
      },
    );

    const byDateData = data
      // start date
      .filter((item) => {
        if (!startDate) return true;
        return DateUtils.isAfterOrEqual(item.date, new Date(startDate));
      })
      // end date
      .filter((item) => {
        if (!endDate) return true;
        return DateUtils.isBeforeOrEqual(item.date, new Date(endDate));
      })
      .map((item) => item);

    // totais
    const totalNormalHours = byDateData.map((item) => item.normalHours);

    const totalHalfExtraHours = byDateData.map((item) => item.halfExtraHours);
    const totalFullExtraHours = byDateData.map((item) => item.fullExtraHours);
    const totalExtraHours = [...totalHalfExtraHours, ...totalFullExtraHours];

    const totalHoursOff = byDateData.map((item) => item.hoursOff);
    const totalAbsenceHours = byDateData.map((item) => item.absenceHours);

    const totals = {
      normalHours: DateUtils.reduceAbsoluteTime(totalNormalHours),
      extraHours: DateUtils.reduceAbsoluteTime(totalExtraHours),
      halfExtraHours: DateUtils.reduceAbsoluteTime(totalHalfExtraHours),
      fullExtraHours: DateUtils.reduceAbsoluteTime(totalFullExtraHours),
      hoursOff: DateUtils.reduceAbsoluteTime(totalHoursOff),
      absenceHours: DateUtils.reduceAbsoluteTime(totalAbsenceHours),
    };

    /************************   RELACAO DIA   *******************************/

    const extraHoursByDepartment: {
      quantity: string;
      quantityInSeconds: number;
      percent?: number;
    }[] = [];
    const extraHoursByDepartmentMap = new Map<
      string,
      (typeof extraHoursByDepartment)[0]
    >();

    const extraHoursByEmployee: {
      employeeName: string;
      department: string;
      extraHours: string;
      extraHoursInSeconds: number;
    }[] = [];

    const extraHoursByEmployeeMap = new Map<
      string,
      (typeof extraHoursByEmployee)[0]
    >();

    for (const item of byDateData) {
      const employeeName = item.employeeName || 'N/D';
      const department = item.department || 'N/D';

      // Horas Extras p/ Departamento
      if (!extraHoursByDepartmentMap.has(department)) {
        const group = {
          quantity: '00:00:00',
          quantityInSeconds: 0,
        };
        extraHoursByDepartment.push(group);
        extraHoursByDepartmentMap.set(department, group);
      }
      const extraHoursGroup = extraHoursByDepartmentMap.get(department)!;
      extraHoursGroup.quantity = DateUtils.reduceAbsoluteTime([
        extraHoursGroup.quantity,
        item.halfExtraHours,
        item.fullExtraHours,
      ]);
      extraHoursGroup.quantityInSeconds = DateUtils.getSecondsFromAbsoluteTime(
        extraHoursGroup.quantity,
      );

      // Horas Extras p/ funcionario
      if (!extraHoursByEmployeeMap.has(employeeName)) {
        const group = {
          employeeName,
          department,
          extraHours: '00:00:00',
          extraHoursInSeconds: 0,
        };
        extraHoursByEmployee.push(group);
        extraHoursByEmployeeMap.set(employeeName, group);
      }
      const extraHoursByEmployeeGroup =
        extraHoursByEmployeeMap.get(employeeName)!;
      extraHoursByEmployeeGroup.extraHours = DateUtils.reduceAbsoluteTime([
        extraHoursByEmployeeGroup.extraHours,
        item.halfExtraHours,
        item.fullExtraHours,
      ]);
      extraHoursByEmployeeGroup.extraHoursInSeconds =
        DateUtils.getSecondsFromAbsoluteTime(
          extraHoursByEmployeeGroup.extraHours,
        );
    }

    // Calcula porcentagens após o loop
    for (const [, obj] of extraHoursByDepartmentMap) {
      // console.log(obj.department, { obj, totals });

      obj.percent = DateUtils.getPercentFromAbsoluteTime(
        obj.quantity,
        totals.extraHours,
      );
    }

    /************************   RELACAO HISTORICO  *******************************/
    const byHistoryData = data
      // start date
      .filter((item) => {
        if (!startDate) return true;

        // Correção: item.date >= startDate
        return DateUtils.isAfterOrEqual(item.date, new Date(startDate));
      })
      // end date
      .filter((item) => {
        if (!endDate) return true;

        // Correção: item.date <= endDate
        return DateUtils.isBeforeOrEqual(item.date, new Date(endDate));
      })
      // department
      .filter((item) => StringUtils.ILike(`%${department}%`, item.department))
      // employee
      .filter((item) =>
        StringUtils.ILike(`%${employeeName}%`, item.employeeName),
      )
      .map((item) => item);

    const day = new Map<
      string,
      { quantity: string; quantityInSeconds: number }
    >();
    const historyExtraHoursByEmployee: {
      employeeName: string;
      department: string;
      extraHours: string;
      extraHoursInSeconds: number;
    }[] = [];

    const historyExtraHoursByEmployeeMap = new Map<
      string,
      (typeof historyExtraHoursByEmployee)[0]
    >();

    const historyAbsenceHoursByEmployee: {
      employeeName: string;
      department: string;
      absenceHours: string;
      absenceHoursInSeconds: number;
    }[] = [];

    const historyAbsenceHoursByEmployeeMap = new Map<
      string,
      (typeof historyAbsenceHoursByEmployee)[0]
    >();

    const historyExtraHoursByDepartment: {
      date: Date;
      department: string;
      extraHours: string;
      extraHoursInSeconds: number;
    }[] = [];

    const historyExtraHoursByDepartmentMap = new Map<
      string,
      (typeof historyExtraHoursByDepartment)[0]
    >();

    const historyAbsenceHoursByDepartment: {
      date: Date;
      department: string;
      absenceHours: string;
      absenceHoursInSeconds: number;
    }[] = [];

    const historyAbsenceHoursByDepartmentMap = new Map<
      string,
      (typeof historyAbsenceHoursByDepartment)[0]
    >();

    const historyHoursRelationByDepartment: {
      department: string;
      extraHours: string;
      extraHoursInSeconds: number;
      absenceHours: string;
      absenceHoursInSeconds: number;
    }[] = [];

    const historyHoursRelationByDepartmentMap = new Map<
      string,
      (typeof historyHoursRelationByDepartment)[0]
    >();

    for (const item of byHistoryData) {
      const employeeName = item.employeeName || 'N/D';
      const department = item.department || 'N/D';
      const dateKey = new Date(item.date).toISOString().split('T')[0];

      // Horas Extras P/ Dia
      const dayExtraHours = DateUtils.reduceAbsoluteTime([
        day.get(dateKey)?.quantity,
        item.halfExtraHours,
        item.fullExtraHours,
      ]);
      day.set(dateKey, {
        quantity: dayExtraHours,
        quantityInSeconds: DateUtils.getSecondsFromAbsoluteTime(dayExtraHours),
      });

      if (!historyExtraHoursByEmployeeMap.has(employeeName)) {
        const group = {
          employeeName,
          department,
          extraHours: '00:00:00',
          extraHoursInSeconds: 0,
        };
        historyExtraHoursByEmployee.push(group);
        historyExtraHoursByEmployeeMap.set(employeeName, group);
      }
      const historyExtraHoursGroup =
        historyExtraHoursByEmployeeMap.get(employeeName)!;
      historyExtraHoursGroup.extraHours = DateUtils.reduceAbsoluteTime([
        historyExtraHoursGroup.extraHours,
        item.halfExtraHours,
        item.fullExtraHours,
      ]);
      historyExtraHoursGroup.extraHoursInSeconds =
        DateUtils.getSecondsFromAbsoluteTime(historyExtraHoursGroup.extraHours);

      // Horas de folga p/ funcionario
      if (!historyAbsenceHoursByEmployeeMap.has(employeeName)) {
        const group = {
          employeeName,
          department,
          absenceHours: '00:00:00',
          absenceHoursInSeconds: 0,
        };
        historyAbsenceHoursByEmployee.push(group);
        historyAbsenceHoursByEmployeeMap.set(employeeName, group);
      }
      const absenceHoursByEmployeeGroup =
        historyAbsenceHoursByEmployeeMap.get(employeeName)!;
      absenceHoursByEmployeeGroup.absenceHours = DateUtils.reduceAbsoluteTime([
        absenceHoursByEmployeeGroup.absenceHours,
        item.absenceHours,
      ]);
      absenceHoursByEmployeeGroup.absenceHoursInSeconds =
        DateUtils.getSecondsFromAbsoluteTime(
          absenceHoursByEmployeeGroup.absenceHours,
        );

      if (!historyExtraHoursByDepartmentMap.has(dateKey.concat(department))) {
        const group = {
          date: new Date(dateKey),
          department,
          extraHours: '00:00:00',
          extraHoursInSeconds: 0,
        };
        historyExtraHoursByDepartment.push(group);
        historyExtraHoursByDepartmentMap.set(dateKey.concat(department), group);
      }
      const historyExtraHoursByDepartmentGroup =
        historyExtraHoursByDepartmentMap.get(dateKey.concat(department))!;

      historyExtraHoursByDepartmentGroup.extraHours =
        DateUtils.reduceAbsoluteTime([
          historyExtraHoursByDepartmentGroup.extraHours,
          item.halfExtraHours,
          item.fullExtraHours,
        ]);
      historyExtraHoursByDepartmentGroup.extraHoursInSeconds =
        DateUtils.getSecondsFromAbsoluteTime(
          historyExtraHoursByDepartmentGroup.extraHours,
        );

      // Horas de folga p/ funcionario
      if (!historyAbsenceHoursByDepartmentMap.has(dateKey.concat(department))) {
        const group = {
          date: new Date(dateKey),
          department,
          absenceHours: '00:00:00',
          absenceHoursInSeconds: 0,
        };
        historyAbsenceHoursByDepartment.push(group);
        historyAbsenceHoursByDepartmentMap.set(
          dateKey.concat(department),
          group,
        );
      }
      const absenceHoursByDepartmentGroup =
        historyAbsenceHoursByDepartmentMap.get(dateKey.concat(department))!;
      absenceHoursByDepartmentGroup.absenceHours = DateUtils.reduceAbsoluteTime(
        [absenceHoursByDepartmentGroup.absenceHours, item.absenceHours],
      );
      absenceHoursByDepartmentGroup.absenceHoursInSeconds =
        DateUtils.getSecondsFromAbsoluteTime(
          absenceHoursByDepartmentGroup.absenceHours,
        );

      // Relação de horas p/ departamento
      if (!historyHoursRelationByDepartmentMap.has(department)) {
        const group = {
          department,
          extraHours: '00:00:00',
          extraHoursInSeconds: 0,
          absenceHours: '00:00:00',
          absenceHoursInSeconds: 0,
        };
        historyHoursRelationByDepartment.push(group);
        historyHoursRelationByDepartmentMap.set(department, group);
      }
      const hoursRelationByDepartmentGroup =
        historyHoursRelationByDepartmentMap.get(department)!;

      hoursRelationByDepartmentGroup.extraHours = DateUtils.reduceAbsoluteTime([
        hoursRelationByDepartmentGroup.extraHours,
        item.halfExtraHours,
        item.fullExtraHours,
      ]);
      hoursRelationByDepartmentGroup.extraHoursInSeconds =
        DateUtils.getSecondsFromAbsoluteTime(
          hoursRelationByDepartmentGroup.extraHours,
        );

      hoursRelationByDepartmentGroup.absenceHours =
        DateUtils.reduceAbsoluteTime([
          hoursRelationByDepartmentGroup.absenceHours,
          item.absenceHours,
        ]);
      hoursRelationByDepartmentGroup.absenceHoursInSeconds =
        DateUtils.getSecondsFromAbsoluteTime(
          hoursRelationByDepartmentGroup.absenceHours,
        );
    }

    /*********************** RETORNO **************************************/
    const response: {
      totals: {
        normalHours: string;
        extraHours: string;
        halfExtraHours: string;
        fullExtraHours: string;
        hoursOff: string;
        absenceHours: string;
      };
      day: {
        extraHoursByDepartment: {
          [k: string]: {
            quantity: string;
            percent?: number;
          };
        };

        extraHoursByEmployee: {
          employeeName: string;
          department: string;
          extraHours: string;
        }[];
      };
      history: {
        extraHoursByDay: {
          [k: string]: {
            quantity: string;
            quantityInSeconds: number;
          };
        };
        extraHoursByEmployee: {
          employeeName: string;
          department: string;
          extraHours: string;
        }[];
        absenceHoursByEmployee: {
          employeeName: string;
          department: string;
          absenceHours: string;
        }[];
        extraHoursByDepartmentByDay: {
          date: Date;
          department: string;
          extraHours: string;
          extraHoursInSeconds: number;
        }[];
        absenceHoursByDepartmentByDay: {
          date: Date;
          department: string;
          absenceHours: string;
          absenceHoursInSeconds: number;
        }[];
        historyHoursRelationByDepartment: {
          [k: string]: {
            extraHours: string;
            extraHoursInSeconds: number;
            absenceHours: string;
            absenceHoursInSeconds: number;
          };
        };
      };
    } = {
      totals,
      day: {
        extraHoursByDepartment: Object.fromEntries(extraHoursByDepartmentMap),

        extraHoursByEmployee,
      },
      history: {
        extraHoursByDay: Object.fromEntries(day),
        extraHoursByDepartmentByDay: historyExtraHoursByDepartment.filter(
          (item) => item.extraHoursInSeconds !== 0,
        ),
        extraHoursByEmployee: historyExtraHoursByEmployee.filter(
          (item) => item.extraHoursInSeconds !== 0,
        ),
        absenceHoursByDepartmentByDay: historyAbsenceHoursByDepartment.filter(
          (item) => item.absenceHoursInSeconds !== 0,
        ),
        absenceHoursByEmployee: historyAbsenceHoursByEmployee.filter(
          (item) => item.absenceHoursInSeconds !== 0,
        ),
        historyHoursRelationByDepartment: Object.fromEntries(
          historyHoursRelationByDepartmentMap,
        ),
      },
    };

    return response;
  }

  async getAnalysesData({
    companyCode,
    department = '',
    employeeName = '',
    startDate,
    endDate,
  }: {
    companyCode: string;
    department?: string;
    employeeName?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    /****************************** comparativo ***************************************/
    const data = await this.getData(companyCode);

    const comparativeData = data
      .filter((item) => StringUtils.ILike(`%${department}%`, item.department))
      // employee
      .filter((item) =>
        StringUtils.ILike(`%${employeeName}%`, item.employeeName),
      );

    // soma total horas extras
    const {
      totalSeconds,
      negativeExtraHours,
      lessThanTwoExtraHoursInSeconds,
      moreThanTwoExtraHoursInSeconds,
    } = comparativeData.reduce(
      (acc, i) => {
        const halfSeconds = DateUtils.getSecondsFromAbsoluteTime(
          i.halfExtraHours,
        );
        const fullSeconds = DateUtils.getSecondsFromAbsoluteTime(
          i.fullExtraHours,
        );
        const totalItemSeconds = halfSeconds + fullSeconds;

        // Soma total de horas extras
        acc.totalSeconds += totalItemSeconds;

        // if (totalItemSeconds < 0) {
        //   acc.negativeExtraHours += totalItemSeconds;
        // } else
        if (totalItemSeconds <= TWO_HOURS_IN_SECONDS) {
          acc.lessThanTwoExtraHoursInSeconds += totalItemSeconds;
        } else {
          acc.moreThanTwoExtraHoursInSeconds += totalItemSeconds;
        }

        return acc;
      },
      {
        totalSeconds: 0,
        negativeExtraHours: 0,
        lessThanTwoExtraHoursInSeconds: 0,
        moreThanTwoExtraHoursInSeconds: 0,
      },
    );

    const totalExtraHours = DateUtils.secondsToHours(totalSeconds);
    // const totalNegativeExtraHours =
    //   DateUtils.secondsToHours(negativeExtraHours);
    const totalLessThanTwoExtraHours = DateUtils.secondsToHours(
      lessThanTwoExtraHoursInSeconds,
    );
    const totalMoreThanTwoExtraHours = DateUtils.secondsToHours(
      moreThanTwoExtraHoursInSeconds,
    );

    // Relação Hs. Extras/ Acima de 2hrs.
    const comparativeHoursRelation: {
      [k: string]: {
        quantity: string;
        percent: number;
      };
    } = {
      // 'Hs. Negativas': {
      //   quantity: totalNegativeExtraHours,
      //   percent: 0,
      // },
      'Abaixo 2Hs/dia': {
        quantity: totalLessThanTwoExtraHours,
        percent: DateUtils.getPercentFromAbsoluteTime(
          totalLessThanTwoExtraHours,
          totalExtraHours,
        ),
      },
      'Acima 2Hs/dia': {
        quantity: totalMoreThanTwoExtraHours,
        percent: DateUtils.getPercentFromAbsoluteTime(
          totalMoreThanTwoExtraHours,
          totalExtraHours,
        ),
      },
    };

    // Hs. Extras e Faltas
    const today = new Date();
    const comparativeHoursRelationByMonthMap = new Map<
      string,
      {
        quantityExtraHours: string;
        quantityExtraHoursInSeconds: number;
        quantityAbsenceHours: string;
        quantityAbsenceHoursInSeconds: number;
      }
    >();
    for (let idx = 12; idx >= 0; idx--) {
      const date = DateUtils.subDate(today, {
        months: idx,
      });
      let startOfMonth = dateFns.startOfMonth(date);
      let endOfMonth = dateFns.endOfMonth(date);

      startOfMonth = dateFns.addHours(startOfMonth, 3);
      endOfMonth = dateFns.addHours(endOfMonth, 3);

      console.log({ idx, startOfMonth, endOfMonth });
      const monthData = comparativeData.filter((i) =>
        DateUtils.isDateInRange(i.date, startOfMonth, endOfMonth),
      );
      const totalExtraHoursInSeconds = monthData.reduce(
        (acc, i) =>
          acc +
          DateUtils.getSecondsFromAbsoluteTime(i.fullExtraHours) +
          DateUtils.getSecondsFromAbsoluteTime(i.halfExtraHours),
        0,
      );

      const totalAbsenceHoursInSeconds = monthData.reduce(
        (acc, i) => acc + DateUtils.getSecondsFromAbsoluteTime(i.absenceHours),
        0,
      );

      // continue if has no data
      if (totalExtraHoursInSeconds === 0 && totalAbsenceHoursInSeconds === 0) {
        continue;
      }

      const hoursMapKey = DateUtils.format(startOfMonth, 'monthly-br-date');
      const hoursMapData = {
        quantityExtraHours: DateUtils.secondsToHours(totalExtraHoursInSeconds),
        quantityExtraHoursInSeconds: totalExtraHoursInSeconds,
        quantityAbsenceHours: DateUtils.secondsToHours(
          totalAbsenceHoursInSeconds,
        ),
        quantityAbsenceHoursInSeconds: totalAbsenceHoursInSeconds,
      };
      comparativeHoursRelationByMonthMap.set(hoursMapKey, hoursMapData);
    }

    /********************** Outliers *********************************/
    const outliersData = data
      .filter((item) => {
        if (!startDate) return true;
        return DateUtils.isAfterOrEqual(item.date, new Date(startDate));
      })
      // end date
      .filter((item) => {
        if (!endDate) return true;
        return DateUtils.isBeforeOrEqual(item.date, new Date(endDate));
      })
      .filter((item) => StringUtils.ILike(`%${department}%`, item.department))
      // employee
      .filter((item) =>
        StringUtils.ILike(`%${employeeName}%`, item.employeeName),
      );

    // const {
    //   irregularExtraHoursByEmployeeInSeconds,
    //   irregularExtraHoursByEmployeeRegistriesAmount,
    //   moreThanTwoExtraHoursByEmployeeInSeconds,
    //   moreThanTwoExtraHoursByEmployeeRegistriesAmount,
    // } = outliersData.reduce(
    //   (acc, i) => {
    //     const extraHoursInSeconds =
    //       DateUtils.getSecondsFromAbsoluteTime(i.fullExtraHours) +
    //       DateUtils.getSecondsFromAbsoluteTime(i.halfExtraHours);

    //     if (
    //       extraHoursInSeconds > TWELVE_HOURS_IN_SECONDS ||
    //       extraHoursInSeconds < 0
    //     ) {
    //       acc.irregularExtraHoursByEmployeeInSeconds += extraHoursInSeconds;
    //       acc.irregularExtraHoursByEmployeeRegistriesAmount += 1;
    //     } else if (extraHoursInSeconds > TWO_HOURS_IN_SECONDS) {
    //       acc.moreThanTwoExtraHoursByEmployeeInSeconds += extraHoursInSeconds;
    //       acc.moreThanTwoExtraHoursByEmployeeRegistriesAmount += 1;
    //     }

    //     return acc;
    //   },
    //   {
    //     irregularExtraHoursByEmployeeRegistriesAmount: 0,
    //     irregularExtraHoursByEmployeeInSeconds: 0,
    //     moreThanTwoExtraHoursByEmployeeRegistriesAmount: 0,
    //     moreThanTwoExtraHoursByEmployeeInSeconds: 0,
    //   },
    // );

    // Totais dos outliers
    const totalExtraHoursInSeconds = outliersData.reduce(
      (acc, i) =>
        acc +
        DateUtils.getSecondsFromAbsoluteTime(i.fullExtraHours) +
        DateUtils.getSecondsFromAbsoluteTime(i.halfExtraHours),
      0,
    );
    const outliersTotals: {
      extraHours: string;
      extraHoursInSeconds: number;
      // +2hs. extras
      moreThanTwoExtraHoursByEmployeeRegistriesAmount: number;
      moreThanTwoExtraHoursByEmployee: string;
      moreThanTwoExtraHoursByEmployeeInSeconds: number;

      // hs. irregulares
      irregularExtraHoursByEmployeeRegistriesAmount: number;
      irregularExtraHoursByEmployee: string;
      irregularExtraHoursByEmployeeInSeconds: number;
    } = {
      extraHours: DateUtils.secondsToHours(totalExtraHoursInSeconds),
      extraHoursInSeconds: totalExtraHoursInSeconds,
      irregularExtraHoursByEmployee: '00:00:00',
      irregularExtraHoursByEmployeeInSeconds: 0,
      irregularExtraHoursByEmployeeRegistriesAmount: 0,
      moreThanTwoExtraHoursByEmployee: '00:00:00',
      moreThanTwoExtraHoursByEmployeeInSeconds: 0,
      moreThanTwoExtraHoursByEmployeeRegistriesAmount: 0,
    };

    // Acima 2hrs p/ registro
    const moreThanTwoExtraHoursRegistries: {
      date: Date;
      employeeName: string;
      department: string;
      extraHours: string;
      extraHoursInSeconds: number;
    }[] = [];

    // Acima 2hrs p/ colaborador
    const moreThanTwoExtraHoursByEmployeeTracker: {
      department: string;
      registriesAmount: number;
      extraHours: string;
      extraHoursInSeconds: number;
    }[] = [];
    const moreThanTwoExtraHoursByEmployeeMap = new Map<
      string,
      (typeof moreThanTwoExtraHoursByEmployeeTracker)[0]
    >();

    // Hs. irregulares p/ registro
    const irregularExtraHoursRegistries: {
      date: Date;
      employeeName: string;
      department: string;
      extraHours: string;
      extraHoursInSeconds: number;
    }[] = [];

    // Hs. irregulares p/ colaborador
    const irregularExtraHoursByEmployeeTracker: {
      department: string;
      registriesAmount: number;
      extraHours: string;
      extraHoursInSeconds: number;
    }[] = [];
    const irregularExtraHoursByEmployeeMap = new Map<
      string,
      (typeof irregularExtraHoursByEmployeeTracker)[0]
    >();

    // Concentração acima de 2hs p/ departamento
    const moreThanTwoExtraHoursByDepartmentTracker: {
      registriesAmount: number;
      percent?: number;
    }[] = [];
    const moreThanTwoExtraHoursByDepartmentMap = new Map<
      string,
      (typeof irregularExtraHoursByDepartmentTracker)[0]
    >();

    // Concentação de hs. irregulares p/ departamento
    const irregularExtraHoursByDepartmentTracker: {
      registriesAmount: number;
      percent?: number;
    }[] = [];
    const irregularExtraHoursByDepartmentMap = new Map<
      string,
      (typeof irregularExtraHoursByDepartmentTracker)[0]
    >();

    for (const item of outliersData) {
      const date = item.date;
      const employeeName = item.employeeName;
      const department = item.department;
      const extraHours = DateUtils.reduceAbsoluteTime([
        item.fullExtraHours,
        item.halfExtraHours,
      ]);
      const extraHoursInSeconds =
        DateUtils.getSecondsFromAbsoluteTime(extraHours);

      const isOverThanTwoExtraHours =
        extraHoursInSeconds > TWO_HOURS_IN_SECONDS &&
        extraHoursInSeconds < TWELVE_HOURS_IN_SECONDS &&
        extraHoursInSeconds > 0;

      const isIrregularExtraHour =
        extraHoursInSeconds > TWELVE_HOURS_IN_SECONDS ||
        extraHoursInSeconds < 0;

      // +2hs
      if (isOverThanTwoExtraHours) {
        outliersTotals.moreThanTwoExtraHoursByEmployee =
          DateUtils.reduceAbsoluteTime([
            outliersTotals.moreThanTwoExtraHoursByEmployee,
            extraHours,
          ]);
        outliersTotals.moreThanTwoExtraHoursByEmployeeInSeconds +=
          extraHoursInSeconds;
        outliersTotals.moreThanTwoExtraHoursByEmployeeRegistriesAmount += 1;
        moreThanTwoExtraHoursRegistries.push({
          date,
          department,
          employeeName,
          extraHours,
          extraHoursInSeconds,
        });
        if (!moreThanTwoExtraHoursByEmployeeMap.has(employeeName)) {
          const group = {
            department,
            extraHours: '00:00:00',
            extraHoursInSeconds: 0,
            registriesAmount: 0,
          };
          moreThanTwoExtraHoursByEmployeeTracker.push(group);
          moreThanTwoExtraHoursByEmployeeMap.set(employeeName, group);
        }
        const moreThanTwoExtraHoursByEmployeeGroup =
          moreThanTwoExtraHoursByEmployeeMap.get(employeeName)!;
        moreThanTwoExtraHoursByEmployeeGroup.extraHours =
          DateUtils.reduceAbsoluteTime([
            moreThanTwoExtraHoursByEmployeeGroup.extraHours,
            item.halfExtraHours,
            item.fullExtraHours,
          ]);
        moreThanTwoExtraHoursByEmployeeGroup.extraHoursInSeconds =
          DateUtils.getSecondsFromAbsoluteTime(
            moreThanTwoExtraHoursByEmployeeGroup.extraHours,
          );
        moreThanTwoExtraHoursByEmployeeGroup.registriesAmount += 1;

        if (!moreThanTwoExtraHoursByDepartmentMap.has(department)) {
          const group = {
            registriesAmount: 0,
            percent: 0,
          };
          moreThanTwoExtraHoursByDepartmentTracker.push(group);
          moreThanTwoExtraHoursByDepartmentMap.set(department, group);
        }
        const moreThanTwoExtraHoursByDepartmentGroup =
          moreThanTwoExtraHoursByDepartmentMap.get(department)!;
        moreThanTwoExtraHoursByDepartmentGroup.registriesAmount += 1;
      }

      if (isIrregularExtraHour) {
        irregularExtraHoursRegistries.push({
          date,
          department,
          employeeName,
          extraHours,
          extraHoursInSeconds,
        });
        outliersTotals.irregularExtraHoursByEmployee =
          DateUtils.reduceAbsoluteTime([
            outliersTotals.irregularExtraHoursByEmployee,
            extraHours,
          ]);
        outliersTotals.irregularExtraHoursByEmployeeInSeconds +=
          extraHoursInSeconds;
        outliersTotals.irregularExtraHoursByEmployeeRegistriesAmount += 1;

        if (!irregularExtraHoursByEmployeeMap.has(employeeName)) {
          const group = {
            department,
            extraHours: '00:00:00',
            extraHoursInSeconds: 0,
            registriesAmount: 0,
          };
          irregularExtraHoursByEmployeeTracker.push(group);
          irregularExtraHoursByEmployeeMap.set(employeeName, group);
        }
        const irregularExtraHoursByEmployeeGroup =
          irregularExtraHoursByEmployeeMap.get(employeeName)!;
        irregularExtraHoursByEmployeeGroup.extraHours =
          DateUtils.reduceAbsoluteTime([
            irregularExtraHoursByEmployeeGroup.extraHours,
            item.halfExtraHours,
            item.fullExtraHours,
          ]);
        irregularExtraHoursByEmployeeGroup.extraHoursInSeconds =
          DateUtils.getSecondsFromAbsoluteTime(
            irregularExtraHoursByEmployeeGroup.extraHours,
          );
        irregularExtraHoursByEmployeeGroup.registriesAmount += 1;

        // concentração p/ departamento
        if (!irregularExtraHoursByDepartmentMap.has(department)) {
          const group = {
            registriesAmount: 0,
            percent: 0,
          };
          irregularExtraHoursByDepartmentTracker.push(group);
          irregularExtraHoursByDepartmentMap.set(department, group);
        }
        const irregularExtraHoursByDepartmentGroup =
          irregularExtraHoursByDepartmentMap.get(department)!;
        irregularExtraHoursByDepartmentGroup.registriesAmount += 1;
      }

      for (const [, obj] of moreThanTwoExtraHoursByDepartmentMap) {
        obj.percent =
          obj.registriesAmount / moreThanTwoExtraHoursRegistries.length;
      }

      for (const [, obj] of irregularExtraHoursByDepartmentMap) {
        obj.percent =
          obj.registriesAmount / irregularExtraHoursRegistries.length;
      }
    }

    const response = {
      comparative: {
        hoursRelation: comparativeHoursRelation,
        hoursRelationByMonth: Object.fromEntries(
          comparativeHoursRelationByMonthMap,
        ),
      },
      outliers: {
        totals: outliersTotals,
        moreThanTwoExtraHoursRegistries,
        moreThanTwoExtraHoursByEmployee: Object.fromEntries(
          moreThanTwoExtraHoursByEmployeeMap,
        ),
        moreThanTwoExtraHoursByDepartment: Object.fromEntries(
          moreThanTwoExtraHoursByDepartmentMap,
        ),
        irregularExtraHoursRegistries,
        irregularExtraHoursByEmployee: Object.fromEntries(
          irregularExtraHoursByEmployeeMap,
        ),

        irregularExtraHoursByDepartment: Object.fromEntries(
          irregularExtraHoursByDepartmentMap,
        ),
      },
    };

    return response;
  }
}
