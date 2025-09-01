import { IntranetDocumentVersion } from '../../entities/intranet-document-version.entity';
import { IntranetDocumentCategoryEnum } from '../../enums/intranet-document-category.enum';

interface GetUserDocumentsDataResponseDtoInput {
  id: string;
  versionId: string;
  key: string;
  name: string;
  description: string;
  category: IntranetDocumentCategoryEnum;
  status: string;
  type: string;
  reviewNumber: string;
  version: string;
  storageType: string;
  storageKey: string;
  createdAt: string;
  createdById: string;
  createdBy: string;
  versionCreatedById: string;
  versionCreatedBy: string;
}

export class GetUserDocumentsDataResponseDto {
  id: string;
  versionId: string;
  key: string;
  name: string;
  description: string;
  category: IntranetDocumentCategoryEnum;
  status: string;
  type: string;
  reviewNumber: string;
  version: string;
  storageType: string;
  storageKey: string;
  createdAt: string;
  createdById: string;
  createdBy: string;
  versionCreatedById: string;
  versionCreatedBy: string;

  constructor(data: GetUserDocumentsDataResponseDtoInput) {
    Object.assign(this, data);
  }
}
