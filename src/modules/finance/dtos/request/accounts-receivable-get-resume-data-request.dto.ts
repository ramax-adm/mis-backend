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

export class AccountsReceivableGetResumeDataRequestDto {
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
}
