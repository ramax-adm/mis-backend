import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DocumentType } from '../../entities/intranet-document-version.entity';
import { IntranetDocumentTypeEnum } from '../../enums/intranet-document-type.enum';

export class CreateIntranetDocumentRequestDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(IntranetDocumentTypeEnum)
  type: IntranetDocumentTypeEnum;
}
