import { User } from '@/services/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'cash_flow_simulations' })
export class CashFlowSimulation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'public_id', generated: 'increment' })
  publicId: number;

  @Column({ name: 'name', nullable: false })
  name?: string;

  @Column({ name: 'request_dto', type: 'json' })
  requestDto: Record<string, any>;

  @Column({ name: 'results', type: 'json' })
  results: Record<string, any>;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date;

  @Column({ name: 'created_by', type: 'uuid' })
  createdById: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedById?: string;

  @Column({ name: 'deleted_by', type: 'uuid', nullable: true })
  deletedById?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy?: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updated_by' })
  updatedBy?: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'deleted_by' })
  deletedBy?: User;
}
