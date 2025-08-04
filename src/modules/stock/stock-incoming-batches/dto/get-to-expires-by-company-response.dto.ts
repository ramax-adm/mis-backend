import { DateUtils } from '@/modules/utils/services/date.utils';
import { NumberUtils } from '@/modules/utils/services/number.utils';

export class GetToExpiresByCompanyResponseDto {
  dueDate: Date;
  companyName: string;
  productLineAcronym: string;
  productLineName: string;
  productCode: string;
  productName: string;
  productClassification: string;
  boxAmount: number;
  quantity: number;
  totalWeightInKg: number;
  daysToExpires: number;

  constructor(data: GetToExpiresByCompanyResponseDto) {
    Object.assign(this, data);
  }

  static create(data: GetToExpiresByCompanyResponseDto) {
    return new GetToExpiresByCompanyResponseDto(data);
  }

  static fromMap(map: Map<string, any>): GetToExpiresByCompanyResponseDto[] {
    const result: GetToExpiresByCompanyResponseDto[] = [];

    for (const [productCode, values] of map.entries()) {
      result.push(
        new GetToExpiresByCompanyResponseDto({
          productCode,
          ...values,
        }),
      );
    }

    return result;
  }

  toJSON() {
    return {
      // TODO
      dueDate: DateUtils.format(this.dueDate, 'date-minified', 'UTC'),
      companyName: this.companyName,
      productLineAcronym: this.productLineAcronym,
      productLineName: this.productLineName,
      productCode: this.productCode,
      productName: this.productName,
      productClassification: this.productClassification,
      boxAmount: NumberUtils.toLocaleString(this.boxAmount ?? 0),
      quantity: NumberUtils.toLocaleString(this.quantity ?? 0),
      totalWeightInKg: NumberUtils.toLocaleString(this.totalWeightInKg ?? 0),
      daysToExpires: this.daysToExpires,
    };
  }
}
