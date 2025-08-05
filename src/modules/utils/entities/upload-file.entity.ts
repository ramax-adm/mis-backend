import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UploadFileInputs } from '../dtos/upload-file-inputs.dto';
import { UploadTypeEnum } from '../enums/upload-type.enum';

@Entity({ name: 'utils_upload_files' })
export class UploadFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name' })
  name: string;

  @Column({ unique: true })
  type: UploadTypeEnum;

  @Column({ name: 'inputs', type: 'simple-json' })
  inputs: UploadFileInputs;

  @Column({ name: 'api_url' })
  apiUrl: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
