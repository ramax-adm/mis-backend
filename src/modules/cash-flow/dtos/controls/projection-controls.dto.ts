import { Expose } from 'class-transformer';

export class ProjectionControlsDto {
  @Expose()
  diasProjecao: number = 90;
}
