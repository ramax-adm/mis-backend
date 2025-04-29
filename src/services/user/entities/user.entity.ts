import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity({ name: 'users' })
@Unique('UQ_EMAIL', ['email'])
export class User {
  @ApiProperty({ example: 'f72503c7-c35e-4afc-a14b-2d5c0be15523' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'João' })
  @Column({ type: 'varchar' })
  name: string;

  @ApiProperty({ example: '33344455566' })
  @Column({ type: 'varchar' })
  cpf: string;

  @ApiProperty({ example: 'joao@finpec.com' })
  @Column({ type: 'varchar' })
  email: string;

  @ApiProperty({ example: '123456' })
  @Column({ type: 'varchar' })
  password: string;

  @ApiProperty({ example: 'some big token' })
  @Column({
    type: 'varchar',
    name: 'refresh_token',
    nullable: true,
  })
  refreshToken: string;

  @ApiProperty({ example: 'some big token' })
  @Column({
    type: 'varchar',
    name: 'password_token',
    nullable: true,
  })
  resetPasswordToken: string;

  @ApiProperty({ example: 'admin' })
  @Column({ type: 'varchar' })
  role: string;

  @ApiProperty({ example: '2024-09-23 16:34:30.398 -0300' })
  @Column({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @ApiProperty({ example: '2024-09-23 16:34:30.398 -0300' })
  @Column({
    name: 'updated_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @ApiProperty({ example: true })
  @Column({
    name: 'is_active',
    type: 'boolean',
    default: false,
  })
  isActive: boolean;

  toJSON() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, resetPasswordToken, ...user } = this;
    return user;
  }
}
