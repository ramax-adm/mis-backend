import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'utils_uploaded_files' })
export class UploadedFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'sync_name' })
  syncName: string;

  @Column({ name: 'file_name' })
  fileName: string;

  @Column({ name: 'extension' })
  extension: string;

  @Column({ name: 'file_size' })
  fileSize: number;

  @Column({ name: 'file_size_unit' })
  fileSizeUnit: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
