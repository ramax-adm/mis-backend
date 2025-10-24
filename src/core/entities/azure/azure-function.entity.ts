import { AzureFunctionAuthLevelEnum } from '@/core/enums/azure-auth-level.enum';
import { AzureFunctionTriggerTypeEnum } from '@/core/enums/azure-trigger-type.enum';
import { HttpMethodsEnum } from '@/core/enums/http-methods.enum';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ schema: 'azure', name: 'azure_function_list' })
export class AzureFunction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'azure_function_id', type: 'varchar', unique: true })
  azureFunctionId: string;

  @Column({ name: 'name', type: 'varchar' })
  name: string;

  @Column({ name: 'key', type: 'varchar' })
  key: string;

  @Column({ name: 'description', type: 'varchar', nullable: true })
  description: string;

  @Column({
    name: 'auth_level',
    type: 'enum',
    enum: AzureFunctionAuthLevelEnum,
    enumName: 'azure_function_auth_level_enum',
    default: AzureFunctionAuthLevelEnum.Function,
  })
  authLevel: AzureFunctionAuthLevelEnum;

  @Column({ name: 'auth_key', type: 'varchar', nullable: true })
  authKey?: string;

  @Column({
    name: 'http_method',
    type: 'enum',
    enum: HttpMethodsEnum,
    enumName: 'http_methods_enum',
    default: HttpMethodsEnum.POST,
  })
  httpMethod: HttpMethodsEnum;

  @Column({ name: 'http_trigger', type: 'varchar', nullable: true })
  httpTrigger?: string;

  @Column({
    name: 'trigger_type',
    type: 'enum',
    enum: AzureFunctionTriggerTypeEnum,
    enumName: 'azure_function_trigger_type_enum',
    default: AzureFunctionTriggerTypeEnum.HTTP,
  })
  triggerType: AzureFunctionTriggerTypeEnum;

  @Column({ name: 'default_params', type: 'jsonb', nullable: true })
  defaultParams?: Record<string, any>;

  @Column({ name: 'cron_expression', type: 'varchar' })
  cronExpression: string;

  @Column({ name: 'is_active', type: 'boolean', default: false })
  isActive: boolean;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({ name: 'created_by', type: 'varchar', nullable: true })
  createdBy?: string;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt: Date;

  @Column({ name: 'updated_by', type: 'varchar', nullable: true })
  updatedBy?: string;
}
