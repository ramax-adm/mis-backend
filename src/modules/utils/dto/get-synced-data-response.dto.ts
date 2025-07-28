import { DateUtils } from '@/modules/utils/services/date.utils';
import { getSyncedFileEntityLabel } from '../constants/get-synced-file-entity';
import { EntitiesEnum } from '../enums/entities.enum';

export interface GetSyncedDataResponseInput {
  id: string;
  createdAt: Date;
  entity: string;
  bucket: string;
  storageType: string;
  fileUrl: string;
}

export class GetSyncedDataResponseDto {
  id: string;
  createdAt: Date;
  entity: string;
  bucket: string;
  storageType: String;
  fileUrl: string;

  constructor(data: GetSyncedDataResponseInput) {
    Object.assign(this, data);
  }

  static create(data: GetSyncedDataResponseInput) {
    return new GetSyncedDataResponseDto(data);
  }

  toJSON() {
    // const parsedCreatedAt = dateFns.addHours(this.createdAt, 3);
    return {
      id: this.id,
      date: DateUtils.format(this.createdAt, 'datetime'),
      entity: getSyncedFileEntityLabel(this.entity as EntitiesEnum),
      storageType: this.storageType,
      bucket: this.bucket,
      fileUrl: this.fileUrl,
    };
  }
}
