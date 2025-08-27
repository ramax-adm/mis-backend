import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { DocumentType } from '../../entities/intranet-document-version.entity';
import { StorageTypesEnum } from '@/modules/utils/enums/storage-types.enum';
import { IntranetDocumentFileTypeEnum } from '../../enums/intranet-document-file-type.enum';
import { Transform } from 'class-transformer';

export class CreateIntranetDocumentVersionRequestDto {
  @IsString()
  documentId: string;

  @IsString()
  key: string;

  @IsString()
  version: string;

  @Transform(({ value }) => Number(value))
  reviewNumber: number;

  @IsString()
  majorChanges: string;

  @IsEnum(IntranetDocumentFileTypeEnum)
  type: IntranetDocumentFileTypeEnum;
}
