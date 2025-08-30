import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { DocumentType } from '../../entities/intranet-document-version.entity';
import { StorageTypesEnum } from '@/modules/utils/enums/storage-types.enum';
import { IntranetDocumentCategoryEnum } from '../../enums/intranet-document-category.enum';
import { Transform } from 'class-transformer';

export class CreateIntranetDocumentVersionRequestDto {
  @IsString()
  documentId: string;

  @IsString()
  key: string;

  @IsString()
  version: string;

  @Transform(({ value }) => (value ? Number(value) : undefined))
  reviewNumber?: number;

  @IsString()
  @IsOptional()
  majorChanges?: string;

  @IsEnum(IntranetDocumentCategoryEnum)
  category: IntranetDocumentCategoryEnum;

  @IsString()
  @IsOptional()
  storageKey?: string;
}
