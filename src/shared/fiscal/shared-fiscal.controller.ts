import { TempLivroFiscal } from '@/core/entities/temp/temp-livro-fiscal.entity';
import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller('shared/fiscal')
export class SharedFiscalController {
  constructor(private readonly dataSource: DataSource) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getFiscalData(
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    const qb = this.dataSource
      .getRepository(TempLivroFiscal)
      .createQueryBuilder('lf');

    if (startDate) {
      qb.andWhere('lf.ENTRADA >= :startDate', { startDate });
    }

    if (endDate) {
      qb.andWhere('lf.ENTRADA <= :endDate', { endDate });
    }

    const fiscalData = await qb.getMany();

    return { fiscalData };
  }
}
