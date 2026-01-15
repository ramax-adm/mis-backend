import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class GetOrdersAnalyticalDataRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value?.split(','))
  companyCodes: string[] = [];

  @ApiPropertyOptional()
  @IsOptional()
  startDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  endDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  orderId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value?.split(','))
  situations?: string[];
}
