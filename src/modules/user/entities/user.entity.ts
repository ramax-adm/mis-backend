import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { UserSensattaCompany } from './user-sensatta-company.entity';
import { UserAppWebpage } from './user-app-webpage.entity';

@Entity({ name: 'users' })
@Unique('UQ_EMAIL', ['email'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  cpf: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({
    type: 'varchar',
    name: 'refresh_token',
    nullable: true,
  })
  refreshToken: string;

  @Column({
    type: 'varchar',
    name: 'password_token',
    nullable: true,
  })
  resetPasswordToken: string;

  @Column({ type: 'varchar' })
  role: string;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: false,
  })
  isActive: boolean;

  @Column({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  // RELATIONS
  @OneToMany(() => UserAppWebpage, (item) => item.user)
  userWebpages: UserAppWebpage[];

  @OneToMany(() => UserSensattaCompany, (item) => item.user)
  userCompanies: UserSensattaCompany[];

  toJSON() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, resetPasswordToken, ...user } = this;
    return user;
  }
}
