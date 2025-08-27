import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {
  DocumentType,
  IntranetDocumentVersion,
} from './intranet-document-version.entity';
import { User } from '@/modules/user/entities/user.entity';
import { IntranetDocumentTypeEnum } from '../enums/intranet-document-type.enum';

@Entity('intranet_documents')
export class IntranetDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column()
  type: IntranetDocumentTypeEnum;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'created_by' })
  createdById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @OneToMany(() => IntranetDocumentVersion, (version) => version.document)
  versions: IntranetDocumentVersion[];
}
