/**
 * Script tonha: TEMPORARIO
 */
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity({ name: 'temp_entidade_geolocalizacao' })
export class TempEntidadeGeolocalizacao {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  ID_ENTIDADE?: string;

  @Column({ type: 'varchar', nullable: true })
  CODIGO_ENTIDADE?: string;

  @Column({ type: 'varchar', nullable: true })
  RAZAO_SOCIAL?: string;

  @Column({ type: 'varchar', nullable: true })
  NOME_FANTASIA?: string;

  @Column({ type: 'varchar', nullable: true })
  ENTIDADES_RELACIONADAS?: string;

  @Column({ type: 'varchar', nullable: true })
  ENTIDADE_ENDERECO?: string;

  @Column({ type: 'varchar', nullable: true })
  ENTIDADE_CIDADE?: string;

  @Column({ type: 'varchar', nullable: true })
  ENTIDADE_UF?: string;

  @Column({ type: 'varchar', nullable: true })
  ENTIDADE_CEP?: string;

  @Column({ type: 'varchar', nullable: true })
  GOOGLE_MAPS_ENDERECO?: string;

  @Column({ type: 'varchar', nullable: true })
  GOOGLE_MAPS_CIDADE?: string;

  @Column({ type: 'varchar', nullable: true })
  GOOGLE_MAPS_UF?: string;

  @Column({ type: 'varchar', nullable: true })
  GOOGLE_MAPS_CEP?: string;

  @Column({ type: 'varchar', nullable: true })
  GOOGLE_MAPS_LATITUDE?: string;

  @Column({ type: 'varchar', nullable: true })
  GOOGLE_MAPS_LONGITUDE?: string;

  @Column({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
