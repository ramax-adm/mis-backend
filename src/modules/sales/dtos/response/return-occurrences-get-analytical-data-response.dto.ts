import { ReturnOccurrence } from '../../entities/return-occurrence.entity';

export class ReturnOccurrencesGetAnalyticalDataResponseDto {
  totals: {
    count: number;
    fatValue: number;
    returnValue: number;
    returnWeightInKg: number;
    returnQuantity: number;
  };
  data: ReturnOccurrence[];

  constructor(data: ReturnOccurrencesGetAnalyticalDataResponseDto) {
    Object.assign(this, data);
  }
}
