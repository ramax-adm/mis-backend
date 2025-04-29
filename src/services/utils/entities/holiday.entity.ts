import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'holidays' })
export class Holiday {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'varchar' })
  weekday: string;
}
