import { TempLivroFiscal } from '@/core/entities/temp/temp-livro-fiscal.entity';
import { Page, PageMeta, PageOptions } from '@/core/paginate';
import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller('shared/fiscal')
export class SharedFiscalController {
  constructor(private readonly dataSource: DataSource) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getFiscalData(
    @Query() pageOptions: PageOptions,
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

    const [fiscalData, total] = await qb
      .skip((pageOptions.page - 1) * pageOptions.limit)
      .take(pageOptions.limit)
      .getManyAndCount();

    const pageMeta = new PageMeta({ pageOptions, total });

    return new Page(fiscalData, pageMeta);
  }
}
