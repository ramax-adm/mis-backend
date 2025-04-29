import * as dateFns from 'date-fns';
import { eachDayOfInterval, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Holiday } from './entities/holiday.entity';
import { NumberUtils } from './number.utils';
import { format as formatDate, toZonedTime } from 'date-fns-tz';

type DateFormat = 'datetime' | 'date' | 'date-minified' | 'international-date';

export class DateUtils {
  static secondsToHours(seconds: number) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = NumberUtils.nb0(seconds % 60);

    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      remainingSeconds.toString().padStart(2, '0'),
    ].join(':');
  }

  /**
   * Método que aplica formatação da data especificada
   * @param value data a ser formatada
   * @param datePattern formato da data
   * @returns data formatada
   */
  static formatDate(
    value: Date,
    datePattern: DateFormats = DateFormats.DATE_BR,
  ): string {
    if (!value) {
      return '';
    }
    value = new Date(value);
    return dateFns.format(value, datePattern);
  }

  /**
   * Método que aplica formatação da data especificada
   *  - date: DD/MM/YYYY
   *  - date-minified: DD/MM
   *  - datetime: DD/MM/YYYY HH:mm:ss
   *  - intenational-date: YYYY-MM-DD
   * @param value data a ser formatada
   * @param dateFormat formato da data: `date` ou `datetime`
   * @returns data formatada
   */
  static format(
    value: Date | string,
    dateFormat: DateFormat = 'date',
    timeZone?: string,
  ): string | null {
    if (!value) return null;

    if (!timeZone) {
      timeZone = 'America/Sao_Paulo';
    }
    const date = toZonedTime(value, timeZone); // Converte para UTC-3

    switch (dateFormat) {
      case 'date':
        return formatDate(date, DateFormats.DATE_BR, { timeZone });
      case 'date-minified':
        return formatDate(date, DateFormats.DATE_BR_MINIFIED, { timeZone });
      case 'international-date':
        return formatDate(date, DateFormats.DATE_US, { timeZone });
      case 'datetime':
        return formatDate(date, DateFormats.DATETIME_BR, { timeZone });
      default:
        throw new Error('Formato de data inválido.');
    }
  }

  static toDate(date?: Date | string): Date {
    if (!date) return new Date();

    if (date instanceof Date) return date;

    const dateFormatRegex = /^\d{4}-\d{1,2}-\d{1,2}$/;
    const isDateFormatCorrect = dateFormatRegex.test(date);
    if (!isDateFormatCorrect) return undefined;

    // Se a data estiver salva no banco YYYY-MM-DD, ele nao perde -1 dia ao fazer o parse de datas
    return dateFns.parseISO(`${date}T03:00:00`);
  }

  static parseFromIsoString(date: string): Date {
    if (date.includes('T')) {
      const parsedDate = new Date(date);
      return isNaN(parsedDate.getTime()) ? undefined : parsedDate;
    }
  }

  static today(): Date {
    return this.toDate();
  }

  static parseAndFormat(date: Date | string, format?: DateFormat): string {
    const parsedDate = this.toDate(date);

    return this.format(parsedDate, format);
  }

  static getDayPeriod(date: Date | string): DayPeriod {
    if (typeof date === 'string') date = new Date(date);

    const hours = date.getHours();

    if (hours >= 5 && hours < 12) {
      return 'morning';
    } else if (hours >= 12 && hours < 18) {
      return 'afternoon';
    } else {
      return 'night';
    }
  }

  static getTodayFormattedDate(): string {
    return this.format(new Date(), 'international-date');
  }

  static isSameDay(date1: Date, date2: Date): boolean {
    return dateFns.isSameDay(date1, date2);
  }

  static formatToISO(baseDate: Date) {
    if (typeof baseDate === 'string') baseDate = new Date(baseDate);
    return baseDate.toISOString();
  }

  static parse(dateString: string, format: string) {
    if (!dateString) {
      return null;
    }
    const parsedDate = dateFns.parse(dateString, format, new Date(), {
      locale: ptBR,
    });
    return parsedDate;
  }

  static extractDateFromValue(
    filename: string,
    regexPattern: RegExp = /(\d{4})-(\d{2})-(\d{2})/,
  ) {
    const match = filename.match(regexPattern);

    return match[0] ? DateUtils.parse(match[0], 'yyyy-MM-dd') : null;
  }

  static sortAscending(dateA: Date | string, dateB: Date | string) {
    dateA = this.toDate(dateA);
    dateB = this.toDate(dateB);

    return dateA.getTime() - dateB.getTime();
  }

  static sortDescending(dateA: Date | string, dateB: Date | string) {
    dateA = this.toDate(dateA);
    dateB = this.toDate(dateB);

    return dateB.getTime() - dateA.getTime();
  }

  static isDateInRange(
    testDate: Date | string,
    startDate: Date | string,
    endDate: Date | string,
  ): boolean {
    testDate = this.toDate(testDate);
    startDate = this.toDate(startDate);
    endDate = this.toDate(endDate);

    return isWithinInterval(testDate, { start: startDate, end: endDate });
  }

  static getBussinessDays(
    startDate: Date | string,
    endDate: Date | string,
    holidays: Holiday[] = [],
  ) {
    const allDays = eachDayOfInterval({
      start: this.toDate(startDate),
      end: this.toDate(endDate),
    });

    return allDays
      .filter(
        (date) =>
          !dateFns.isWeekend(date) &&
          !holidays.some((holiday) =>
            this.isSameDay(date, this.toDate(holiday.date)),
          ),
      )
      .map((date) => this.format(date, 'international-date'));
  }

  static getDifferenceInDays(startDate: Date | string, endDate: Date | string) {
    startDate = this.toDate(startDate);
    endDate = this.toDate(endDate);
    return dateFns.differenceInDays(endDate, startDate);
  }
}

export enum DateFormats {
  DATE_BR = 'dd/MM/yyyy',
  DATE_BR_MINIFIED = 'dd/MM',
  DATETIME_BR = 'dd/MM/yyyy HH:mm:ss',
  DATETIME_BR_TZ = 'dd/MM/yyyy HH:mm:ss XXX',
  DATE_US = 'yyyy-MM-dd',
  DATETIME_US = 'yyyy-MM-dd HH:mm:ss',
  DATETIME_US_TZ = 'yyyy-MM-dd HH:mm:ss XXX',
  DATETIME_US_ISO = 'yyyy-MM-ddTHH:mm:ss.XXX',
}

export enum DateParseFormats {
  CDZ_FORMAT = 'yyyyMMdd',
  DATE_BR_FORMAT = 'dd/MM/yyyy',
}

export type DayPeriod = 'morning' | 'afternoon' | 'night';
export enum DayPeriodEnum {
  MORNING = 'morning',
  AFTERNOON = 'afternoon',
  NIGHT = 'night',
}
