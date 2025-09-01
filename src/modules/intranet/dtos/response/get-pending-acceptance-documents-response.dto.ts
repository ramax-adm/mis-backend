import { UserRole } from '@/core/enums/user-role.enum';
import { IntranetDocumentVersion } from '../../entities/intranet-document-version.entity';

interface GetPendingAcceptanceDocumentsResponseDtoInput {
  userId: string;
  userName: string;
  userRole: UserRole;
  userRoleName: string;
  pendencesQuantity: number;
  pendingDocumentVersions: IntranetDocumentVersion[];
}

export class GetPendingAcceptanceDocumentsResponseDto {
  userId: string;
  userName: string;
  userRole: UserRole;
  userRoleName: string;
  pendencesQuantity: number;
  pendingDocumentVersions: IntranetDocumentVersion[];

  constructor(data: GetPendingAcceptanceDocumentsResponseDtoInput) {
    Object.assign(this, data);
  }
}
