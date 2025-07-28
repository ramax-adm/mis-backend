import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'external_human_resources_hours' })
export class ExternalHumanResourcesHours {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'date', type: 'date' })
  date: Date;

  @Column({ name: 'integration_system' })
  integrationSystem: string;

  @Column({ name: 'companyCode' })
  companyCode: string;

  @Column({ name: 'payroll_number' })
  payrollNumber: string; // numero folha

  @Column({ name: 'employee_name' })
  employeeName: string; // funcionario

  @Column({ name: 'department' })
  department: string; // departamento

  @Column({ name: 'normal_hours' })
  normalHours: string; // horas normais

  @Column({ name: 'hours_off', nullable: true })
  hoursOff: string; // horas normais

  @Column({ name: 'absence_hours', nullable: true })
  absenceHours: string; // horas de falta

  @Column({ name: 'half_extra_hours', nullable: true })
  halfExtraHours: string; // horas extra 50%

  @Column({ name: 'full_extra_hours', nullable: true })
  fullExtraHours: string; // horas extra 100%

  @Column({ name: 'absence_justification', nullable: true })
  absenceJustification: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
