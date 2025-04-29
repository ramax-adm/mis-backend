import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsOptional, IsUUID } from 'class-validator';

export class BaseOutputDto {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty()
  @IsDate()
  createdAt: Date;

  @ApiProperty()
  @IsDate()
  @IsOptional()
  updatedAt?: Date;

  @ApiProperty()
  @IsDate()
  @IsOptional()
  deletedAt?: Date;

  @ApiProperty()
  @IsUUID()
  createdBy: string;

  @ApiProperty()
  @IsUUID()
  @IsOptional()
  updatedBy?: string;

  @ApiProperty()
  @IsUUID()
  @IsOptional()
  deletedBy?: string;
}
