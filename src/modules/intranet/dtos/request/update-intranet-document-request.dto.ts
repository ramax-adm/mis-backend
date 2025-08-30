import { PartialType } from '@nestjs/swagger';
import { CreateIntranetDocumentRequestDto } from './create-intranet-document-request.dto';

export class UpdateIntranetDocumentRequestDto extends PartialType(
  CreateIntranetDocumentRequestDto,
) {}
