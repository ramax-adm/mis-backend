import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvoicesNfTypesEnum } from '../../enums/invoices-nf-types.enum';
import { InvoicesSituationsEnum } from '../../enums/invoices-situations.enum';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class SalesInvoicesGetAnalyticalDataRequestDto {
  @ApiProperty()
  @IsDateString()
  startDate: Date;

  @ApiProperty()
  @IsDateString()
  endDate: Date;

  @ApiPropertyOptional()
  @Transform(({ value }) => value?.split(','))
  @IsOptional()
  companyCodes?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  clientCode?: string;

  @ApiPropertyOptional()
  @Transform(({ value }) => value?.split(','))
  @IsOptional()
  cfopCodes?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  nfType?: InvoicesNfTypesEnum;

  @ApiPropertyOptional()
  @IsOptional()
  nfNumber?: string;

  @ApiPropertyOptional()
  @Transform(({ value }) => value?.split(','))
  @IsOptional()
  nfSituations?: InvoicesSituationsEnum[];
}
