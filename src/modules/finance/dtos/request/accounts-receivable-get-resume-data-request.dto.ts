import { IsArray, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class AccountsReceivableGetResumeDataRequestDto {
  @ApiProperty()
  @IsDateString()
  startDate: Date;

  @ApiProperty()
  @IsDateString()
  endDate: Date;

  @ApiPropertyOptional({ type: 'string' })
  @Transform(({ value }) => value?.split(','))
  @IsArray()
  @IsOptional()
  companyCodes?: string[];
}
