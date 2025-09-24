import { TempBalancete } from '@/core/entities/temp/temp-balancete.entity';
import { TempLivroFiscal } from '@/core/entities/temp/temp-livro-fiscal.entity';
import { TempRazaoContabil } from '@/core/entities/temp/temp-razao-contabil.entity';
import { Page, PageMeta, PageOptions } from '@/core/paginate';
import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller('shared/fiscal')
export class SharedFiscalController {
  constructor(private readonly dataSource: DataSource) {}

  @Get('livro-fiscal')
  @HttpCode(HttpStatus.OK)
  async getLivroFiscalData(
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

  @Get('balancete')
  @HttpCode(HttpStatus.OK)
  async getBalanceteData(@Query() pageOptions: PageOptions) {
    const qb = this.dataSource
      .getRepository(TempBalancete)
      .createQueryBuilder('b');

    const [fiscalData, total] = await qb
      .skip((pageOptions.page - 1) * pageOptions.limit)
      .take(pageOptions.limit)
      .getManyAndCount();

    const pageMeta = new PageMeta({ pageOptions, total });

    return new Page(fiscalData, pageMeta);
  }

  @Get('razao-contabil')
  @HttpCode(HttpStatus.OK)
  async getRazaoContabilData(
    @Query() pageOptions: PageOptions,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    const qb = this.dataSource
      .getRepository(TempRazaoContabil)
      .createQueryBuilder('rc');

    if (startDate) {
      qb.andWhere('rc.DATA >= :startDate', { startDate });
    }

    if (endDate) {
      qb.andWhere('rc.DATA <= :endDate', { endDate });
    }

    const [fiscalData, total] = await qb
      .skip((pageOptions.page - 1) * pageOptions.limit)
      .take(pageOptions.limit)
      .getManyAndCount();

    const pageMeta = new PageMeta({ pageOptions, total });

    return new Page(fiscalData, pageMeta);
  }
}
