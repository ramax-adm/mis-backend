import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IntranetDocument } from './intranet-document.entity';
import { User } from '@/modules/user/entities/user.entity';
import { UserIntranetDocumentAcceptance } from '@/modules/user/entities/user-intranet-documents-acceptance.entity';
import { StorageTypesEnum } from '@/modules/utils/enums/storage-types.enum';

export type DocumentType = 'document' | 'video';

@Entity('intranet_documents_versions')
export class IntranetDocumentVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => IntranetDocument, (doc) => doc.versions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'document_id' })
  document: IntranetDocument;

  @Column({ name: 'document_id' })
  documentId: string;

  @Column({ type: 'varchar', length: 50 })
  key: string;

  @Column({ type: 'varchar', length: 50 })
  version: string;

  @Column({ name: 'review_number', type: 'int' })
  reviewNumber: number;

  @Column({ name: 'major_changes' })
  majorChanges: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  extension?: string;

  @Column({ name: 'storage_type', nullable: true })
  storageType?: StorageTypesEnum;

  @Column({ name: 'storage_key', type: 'varchar', length: 255, nullable: true })
  storageKey?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'created_by' })
  createdById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @OneToMany(
    () => UserIntranetDocumentAcceptance,
    (acceptance) => acceptance.documentVersion,
  )
  acceptances: UserIntranetDocumentAcceptance[];
}
