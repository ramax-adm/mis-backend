import { UploadTypeEnum } from '../enums/upload-type.enum';

export type UploadFileInputType = {
  id: string;
  label: string;
  type: string;
};

export class UploadFileInput {
  id: string;
  label: string;
  type: string;

  constructor(data: UploadFileInputType) {
    Object.assign(this, data);
  }
}

export type UploadFileInputs = UploadFileInput[];
