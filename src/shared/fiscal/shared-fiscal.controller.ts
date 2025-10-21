import { ApiControllerDoc } from '@/core/decorators/api-doc.decorator';
import { ApiKeyAuth } from '@/core/decorators/api-key-auth.decorator';
import { TempBalancete } from '@/core/entities/temp/temp-balancete.entity';
import { TempLivroFiscal } from '@/core/entities/temp/temp-livro-fiscal.entity';
import { TempRazaoContabil } from '@/core/entities/temp/temp-razao-contabil.entity';
import { TempTitulosPagar } from '@/core/entities/temp/temp-titulos-pagar.entity';
import { Page, PageMeta, PageOptions } from '@/core/paginate';
import { ApiKeyGuard } from '@/modules/auth/guards/api-key-guard';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { DataSource } from 'typeorm';

@ApiTags('Shared:FISCAL')
@ApiKeyAuth()
@UseGuards(ApiKeyGuard)
@Controller('shared/fiscal')
export class SharedFiscalController {
  constructor(private readonly dataSource: DataSource) {}

  @ApiControllerDoc({
    summary: 'Compartilhado: Livro Fiscal',
    description: 'Retorna os registros do livro fiscal (Integração TONHA).',
    successStatus: HttpStatus.OK,
  })
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

  @ApiControllerDoc({
    summary: 'Compartilhado: Balancete',
    description: 'Retorna os registros do balancete (Integração TONHA).',
    successStatus: HttpStatus.OK,
  })
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

  @ApiControllerDoc({
    summary: 'Compartilhado: Razão Contabil',
    description: 'Retorna os registros de razao contabil (Integração TONHA).',
    successStatus: HttpStatus.OK,
  })
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

  @ApiControllerDoc({
    summary: 'Compartilhado: Titulos a Pagar',
    description: 'Retorna os registros de titulos a pagar (Integração TONHA).',
    successStatus: HttpStatus.OK,
  })
  @Get('titulos-pagar')
  @HttpCode(HttpStatus.OK)
  async getTitulosPagarData(
    @Query() pageOptions: PageOptions,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    const qb = this.dataSource
      .getRepository(TempTitulosPagar)
      .createQueryBuilder('ttp');

    if (startDate) {
      qb.andWhere('ttp.DATA_EMISSAO >= :startDate', { startDate });
    }

    if (endDate) {
      qb.andWhere('ttp.DATA_EMISSAO <= :endDate', { endDate });
    }

    const [fiscalData, total] = await qb
      .skip((pageOptions.page - 1) * pageOptions.limit)
      .take(pageOptions.limit)
      .getManyAndCount();

    const pageMeta = new PageMeta({ pageOptions, total });

    return new Page(fiscalData, pageMeta);
  }
}
