import { IntranetDocumentVersion } from '@/modules/intranet/entities/intranet-document-version.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';

@Entity('users_intranet_documents_acceptance')
@Unique(['userId', 'documentVersionId'])
export class UserIntranetDocumentAcceptance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'document_version_id' })
  documentVersionId: string;

  @ManyToOne(() => IntranetDocumentVersion, (version) => version.acceptances, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'document_version_id' })
  documentVersion: IntranetDocumentVersion;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
