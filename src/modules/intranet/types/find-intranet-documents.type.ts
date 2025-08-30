import { IntranetDocumentCategoryEnum } from '../enums/intranet-document-category.enum';

export type FindIntranetDocumentsRawItem = {
  id: string;
  version_id: string;
  name: string;
  description: string;
  category: IntranetDocumentCategoryEnum;
  type: string;
  created_at: string;
  created_by_id: string;
  created_by: string;
  key: string;
  review_number: string;
  version: string;
  storage_type: string;
  storage_key: string;
  version_created_by_id: string;
  version_created_by: string;
  status: string;
};

export type FindIntranetDocumentsItem = {
  id: string;
  versionId: string;
  name: string;
  description: string;
  category: IntranetDocumentCategoryEnum;
  type: string;
  createdAt: string;
  createdById: string;
  createdBy: string;
  key: string;
  reviewNumber: string;
  version: string;
  storageType: string;
  storageKey: string;
  versionCreatedById: string;
  versionCreatedBy: string;
  status: string;
};
