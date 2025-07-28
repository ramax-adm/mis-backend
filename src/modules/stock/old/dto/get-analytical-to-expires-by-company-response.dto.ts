import { DateUtils } from '@/modules/utils/services/date.utils';
import { NumberUtils } from '@/modules/utils/services/number.utils';

export class GetAnalyticalToExpiresByCompanyResponseDto {
  dueDate: Date;
  companyName: string;
  productLineAcronym: string;
  productLineCode: string;
  productLineName: string;
  productCode: string;
  productName: string;
  productClassification: string;
  boxAmount: number;
  quantity: number;
  totalWeightInKg: number;
  basePriceCar: number;
  basePriceTruck: number;
  totalPrice: number;
  daysToExpires: number;

  constructor(data: GetAnalyticalToExpiresByCompanyResponseDto) {
    Object.assign(this, data);
  }

  static create(data: GetAnalyticalToExpiresByCompanyResponseDto) {
    return new GetAnalyticalToExpiresByCompanyResponseDto(data);
  }

  static fromMap(
    map: Map<string, any>,
  ): GetAnalyticalToExpiresByCompanyResponseDto[] {
    const result: GetAnalyticalToExpiresByCompanyResponseDto[] = [];

    for (const [productCode, values] of map.entries()) {
      result.push(
        new GetAnalyticalToExpiresByCompanyResponseDto({
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
      productLineCode: this.productLineCode,
      productLineName: this.productLineName,
      productCode: this.productCode,
      productName: this.productName,
      productClassification: this.productClassification,
      boxAmount: NumberUtils.toLocaleString(this.boxAmount ?? 0),
      quantity: NumberUtils.toLocaleString(this.quantity ?? 0),
      totalWeightInKg: NumberUtils.toLocaleString(this.totalWeightInKg ?? 0),
      basePriceCar: NumberUtils.toLocaleString(this.basePriceCar ?? 0, 2),
      basePriceTruck: NumberUtils.toLocaleString(this.basePriceTruck ?? 0, 2),
      totalPrice: NumberUtils.toLocaleString(this.totalPrice ?? 0),
      daysToExpires: this.daysToExpires,
    };
  }
}
