import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { AccountReceivableStatusEnum } from '../../enums/account-receivable-status.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AccountReceivableVisualizationEnum } from '../../enums/account-receivable-visualization.enum';
import { AccountReceivableBucketSituationEnum } from '../../enums/account-receivable-bucket-situation.enum';
import { Transform } from 'class-transformer';

export class AccountsReceivableGetAnalyticalDataRequestDto {
  // baseDate: Date;
  @ApiProperty()
  @IsDateString()
  startDate: Date;

  @ApiProperty()
  @IsDateString()
  endDate: Date;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  companyCode?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  clientCode?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  key?: string;

  @ApiPropertyOptional()
  @IsEnum(AccountReceivableStatusEnum)
  @IsOptional()
  status?: AccountReceivableStatusEnum;

  @ApiPropertyOptional()
  @IsEnum(AccountReceivableVisualizationEnum)
  @IsOptional()
  visualizationType?: AccountReceivableVisualizationEnum;

  @ApiPropertyOptional()
  @Transform(({ value }) => value?.split(','))
  @IsArray()
  @IsOptional()
  bucketSituations?: AccountReceivableBucketSituationEnum[];
}
