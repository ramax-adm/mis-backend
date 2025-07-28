import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'utils_storage_synced_files' })
export class UtilsStorageSyncedFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'storage_type', type: 'varchar' })
  storageType: string;

  @Column()
  entity: string;

  @Column({ name: 'file_url' })
  fileUrl: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
