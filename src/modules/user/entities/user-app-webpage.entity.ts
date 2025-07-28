import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { AppWebpage } from '@/core/entities/application/app-webpage.entity';

@Entity({ name: 'users_app_webpages' })
export class UserAppWebpage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (item) => item.userWebpages)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'page_id' })
  pageId: string;

  @ManyToOne(() => AppWebpage, (item) => item.userWebpages)
  @JoinColumn({ name: 'page_id' })
  page: AppWebpage;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
