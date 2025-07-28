import { Transform, Type } from 'class-transformer';
import { IsString } from 'class-validator';

export class ExportStockReportDto {
  @IsString()
  exportType: 'resumed' | 'analytical';

  filters: {
    companyCode: string;
    productLineAcronyms: { companyCode: string; values: string[] }[];
  };
}
