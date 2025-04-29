import { DateUtils } from '@/services/utils/date.utils';
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { isValid, startOfDay } from 'date-fns';

@Injectable()
export class ParseDatePipe implements PipeTransform {
  transform(value: string): Date {
    if (!value) return startOfDay(new Date());

    const date = DateUtils.toDate(value);
    if (!isValid(date)) {
      throw new BadRequestException('Invalid date format');
    }

    return startOfDay(date);
  }
}
