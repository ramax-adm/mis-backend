import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class GetReturnOccurrencesAnalyticalDataRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  companyCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  startDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  endDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  clientCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  representativeCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  occurrenceNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  returnType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (value ? value.split(',') : null))
  occurrenceCauses?: string[];
}
