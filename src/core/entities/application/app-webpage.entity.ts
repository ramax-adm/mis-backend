import { UserAppWebpage } from '@/modules/user/entities/user-app-webpage.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'app_webpages' })
export class AppWebpage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name?: string;

  @Column()
  page: string;

  @Column({ name: 'is_public', default: false })
  isPublic: boolean;

  @Column({ name: 'is_auth_page', default: true })
  isAuthPage: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  // relations
  @OneToMany(() => UserAppWebpage, (item) => item.page)
  userWebpages: UserAppWebpage[];
}
