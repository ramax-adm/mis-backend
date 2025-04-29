import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { StringUtils } from '../utils/string.utils';
import { GetStockByCompanyResponseDto } from './dto/get-stock-by-company-response.dto';
import { GetToExpiresByCompanyResponseDto } from './dto/get-to-expires-by-company-response.dto';
import { DateUtils } from '../utils/date.utils';
import {
  GetIncomingBatchesQueryResponse,
  StockOptionalData,
} from './types/stock.types';
import { GetStockLastUpdatedAtResponseDto } from './dto/get-stock-last-updated-at-response.dto';
import { Company } from '@/common/entities/sensatta/company.entity';
import { IncomingBatches } from '@/common/entities/sensatta/incoming-batch.entity';
import { ReferencePrice } from '@/common/entities/sensatta/reference-price.entity';
import { StockUtilsService } from './stock-utils.service';
import { INCOMING_BATCHES_QUERY } from './constants/incoming-batches-query';
import { GetAnalyticalStockByCompanyResponseDto } from './dto/get-analytical-stock-by-company-response.dto';
import { GetAnalyticalToExpiresByCompanyResponseDto } from './dto/get-analytical-to-expires-by-company-response.dto';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(ReferencePrice)
    private readonly referencePriceRepository: Repository<ReferencePrice>,
    @InjectRepository(IncomingBatches)
    private readonly incomingBatchesRepository: Repository<IncomingBatches>,
    private readonly dataSource: DataSource,
    private readonly stockUtilsService: StockUtilsService,
  ) {}

  // Busca o valor de quando o registro foi recriado no banco
  async getStockLastUpdatedAt() {
    const [entryBatch] = await this.incomingBatchesRepository.find({ take: 1 });

    // Toda vez que eu atualizo os dados (dou carga novamente) o dado é recriado
    return {
      updatedAt: entryBatch.createdAt,
    } as GetStockLastUpdatedAtResponseDto;
  }

  // Busca dados gerais e os relaciona entre os dados de lote entrada
  async getIncomingBatchesData(company: Company) {
    // constants
    const query = INCOMING_BATCHES_QUERY;
    const isWarehouseCodeConsideredOnStock = true;
    const companyCode = company.sensattaCode;

    const result = await this.dataSource.query<
      GetIncomingBatchesQueryResponse[]
    >(query, [companyCode, isWarehouseCodeConsideredOnStock]);
    return result;
  }

  // Retorna os dados de preço de referencia
  async getReferencePricesData() {
    return await this.referencePriceRepository.find();
  }

  /**
   * RESUMO
   */

  // Busca dados de estoque por produto
  async getResumedStockByCompany(
    companyCode: string,
    {
      company,
      incomingBatchesWithRelations: incomingBatches,
      refPrices,
    }: StockOptionalData,
  ) {
    if (!company) {
      company = await this.companyRepository.findOne({
        where: {
          sensattaCode: companyCode,
        },
      });
    }

    if (!company) {
      throw new NotFoundException('A empresa em si nao existe.');
    }

    if (!incomingBatches || !refPrices) {
      [incomingBatches, refPrices] = await Promise.all([
        this.getIncomingBatchesData(company),
        this.getReferencePricesData(),
      ]);
    }

    const map = new Map<string, any>();

    for (const batch of incomingBatches) {
      if (!batch.productCode) {
        continue;
      }

      const price = refPrices.find(
        (item) =>
          item.productId == batch.productId &&
          item.companyCode == batch.companyCode,
      )?.price;

      const hasPreviousValues = map.has(batch.productCode);

      const data = {
        companyName: company?.name,
        productLineAcronym: batch.productLineAcronym,
        productLineName: batch.productLineName,
        productName: batch.productName,
        productClassification: batch.productClassification,
        basePrice: price ?? 0,
      };

      if (hasPreviousValues) {
        const previousValues = map.get(batch.productCode);

        const newBoxAmount = previousValues?.boxAmount + batch.boxAmount;
        const newQuantity = previousValues?.quantity + batch.quantity;
        const newWeight = previousValues?.totalWeightInKg + batch.weightInKg;

        Object.assign(data, {
          boxAmount: newBoxAmount,
          quantity: newQuantity,
          totalWeightInKg: newWeight,
          totalPrice: data.basePrice * newWeight,
        });
      } else {
        Object.assign(data, {
          boxAmount: batch.boxAmount,
          quantity: batch.quantity,
          totalWeightInKg: batch.weightInKg,
          totalPrice: data.basePrice * batch.weightInKg,
        });
      }

      map.set(batch.productCode, data);
    }

    const response = GetStockByCompanyResponseDto.fromMap(map);
    return response;
  }

  // Busca dados de estoque FIFO
  async getResumedToExpiresByCompany(
    companyCode: string,
    {
      company,
      incomingBatchesWithRelations: incomingBatches,
    }: StockOptionalData,
  ) {
    if (!company) {
      company = await this.companyRepository.findOne({
        where: {
          sensattaCode: companyCode,
        },
      });
    }

    if (!company) {
      throw new NotFoundException('A empresa em si nao existe.');
    }

    if (!incomingBatches) {
      incomingBatches = await this.getIncomingBatchesData(company);
    }
    const map = new Map<string, any>();

    for (const batch of incomingBatches) {
      if (!batch.productCode) {
        continue;
      }

      const key = batch.productCode.concat(
        DateUtils.format(batch.dueDate, 'international-date'),
      );
      const hasPreviousValues = map.has(key);

      const data = {
        dueDate: batch.dueDate,
        productCode: batch.productCode,
        companyName: company?.name,
        productLineAcronym: batch.productLineAcronym,
        productLineName: batch.productLineName,
        productName: batch.productName,
        productClassification: batch.productClassification,
        daysToExpires: DateUtils.getDifferenceInDays(
          DateUtils.today(),
          batch.dueDate,
        ),
      };

      if (hasPreviousValues) {
        const previousValues = map.get(key);

        const newBoxAmount = previousValues?.boxAmount + batch.boxAmount;
        const newQuantity = previousValues?.quantity + batch.quantity;
        const newWeight = previousValues?.totalWeightInKg + batch.weightInKg;

        Object.assign(data, {
          boxAmount: newBoxAmount,
          quantity: newQuantity,
          totalWeightInKg: newWeight,
        });
      } else {
        Object.assign(data, {
          boxAmount: batch.boxAmount,
          quantity: batch.quantity,
          totalWeightInKg: batch.weightInKg,
        });
      }

      map.set(key, data);
    }

    const response = GetToExpiresByCompanyResponseDto.fromMap(map);
    return response;
  }

  // Busca ambos os dados: Estoque por produto e Estoque FIFO de todas as empresas
  async getResumedStockData() {
    const companies = await this.companyRepository.find({
      where: {
        isConsideredOnStock: true,
      },
    });

    const response: {
      companyCode: string;
      companyName: string;
      stockData: GetStockByCompanyResponseDto[];
      toExpiresData: GetToExpiresByCompanyResponseDto[];
    }[] = [];

    for (const company of companies) {
      try {
        const data = {
          companyCode: company.sensattaCode,
          companyName: company.name,
        };

        const [stockData, toExpiresData] = await Promise.all([
          this.getResumedStockByCompany(company.sensattaCode, {
            company,
          }),
          this.getResumedToExpiresByCompany(company.sensattaCode, {
            company,
          }),
        ]);

        response.push({
          ...data,
          stockData: stockData,
          toExpiresData: toExpiresData,
        });
      } catch (error) {
        console.log(error);
        console.error(
          `Erro a buscar dados da empresa ${company.sensattaCode}!`,
        );
      }
    }

    return response;
  }

  /**
   * ANALITICO
   */

  // Busca dados ANALITICOS de estoque por produto
  async getAnalyticalStockByCompany(
    companyCode: string,
    { company }: StockOptionalData,
  ) {
    if (!company) {
      company = await this.companyRepository.findOne({
        where: {
          sensattaCode: companyCode,
        },
      });
    }

    if (!company) {
      throw new NotFoundException('A empresa em si nao existe.');
    }

    const [incomingBatches, refPrices] = await Promise.all([
      this.getIncomingBatchesData(company),
      this.getReferencePricesData(),
    ]);

    const basePrices = refPrices.filter((item) =>
      StringUtils.ILike('%TABELA BASE%', item.mainDescription),
    );

    const map = new Map<string, any>();
    for (const batch of incomingBatches) {
      if (!batch.productCode) {
        continue;
      }

      // Preco base
      const { price: basePrice } = basePrices.find(
        (item) =>
          item.productId == batch.productId &&
          item.companyCode == batch.companyCode,
      ) ?? { price: 0 };

      const allPricesByState = this.stockUtilsService.getPriceMap(
        batch,
        refPrices,
      );

      const hasPreviousValues = map.has(batch.productCode);

      const data = {
        companyName: company?.name,
        productLineAcronym: batch.productLineAcronym,
        productLineCode: batch.productLineCode,
        productLineName: batch.productLineName,
        productName: batch.productName,
        productClassification: batch.productClassification,
        basePrice,
        ...allPricesByState,
      };

      if (hasPreviousValues) {
        const previousValues = map.get(batch.productCode);

        const newBoxAmount = previousValues?.boxAmount + batch.boxAmount;
        const newQuantity = previousValues?.quantity + batch.quantity;
        const newWeight = previousValues?.totalWeightInKg + batch.weightInKg;

        Object.assign(data, {
          boxAmount: newBoxAmount,
          quantity: newQuantity,
          totalWeightInKg: newWeight,
          totalPrice: data.basePrice * newWeight,
        });
      } else {
        Object.assign(data, {
          boxAmount: batch.boxAmount,
          quantity: batch.quantity,
          totalWeightInKg: batch.weightInKg,
          totalPrice: data.basePrice * batch.weightInKg,
        });
      }

      map.set(batch.productCode, data);
    }

    const response = GetAnalyticalStockByCompanyResponseDto.fromMap(map);

    return response;
  }

  // Busca dados ANALITICOS de estoque FIFO
  async getAnalyticalToExpiresByCompany(
    companyCode: string,
    { company }: StockOptionalData,
  ) {
    if (!company) {
      company = await this.companyRepository.findOne({
        where: {
          sensattaCode: companyCode,
        },
      });
    }

    if (!company) {
      throw new NotFoundException('A empresa em si nao existe.');
    }

    const [incomingBatches, refPrices] = await Promise.all([
      this.getIncomingBatchesData(company),
      this.getReferencePricesData(),
    ]);

    const baseReferencePriceEntity = refPrices.filter((item) =>
      StringUtils.ILike('%TABELA BASE%', item.mainDescription),
    );

    const map = new Map<string, any>();

    for (const batch of incomingBatches) {
      if (!batch.productCode) {
        continue;
      }
      // Preco base
      const { price: basePrice } = baseReferencePriceEntity.find(
        (item) =>
          item.productId == batch.productId &&
          item.companyCode == batch.companyCode,
      ) ?? { price: 0 };

      const key = batch.productCode.concat(
        DateUtils.format(batch.dueDate, 'international-date'),
      );
      const hasPreviousValues = map.has(key);

      const data = {
        dueDate: batch.dueDate,
        companyName: company?.name,
        productLineAcronym: batch.productLineAcronym,
        productLineCode: batch.productLineCode,
        productLineName: batch.productLineName,
        productCode: batch.productCode,
        productName: batch.productName,
        productClassification: batch.productClassification,
        basePrice,
        daysToExpires: DateUtils.getDifferenceInDays(
          DateUtils.today(),
          batch.dueDate,
        ),
      };

      if (hasPreviousValues) {
        const previousValues = map.get(key);

        const newBoxAmount = previousValues?.boxAmount + batch.boxAmount;
        const newQuantity = previousValues?.quantity + batch.quantity;
        const newWeight = previousValues?.totalWeightInKg + batch.weightInKg;

        Object.assign(data, {
          boxAmount: newBoxAmount,
          quantity: newQuantity,
          totalWeightInKg: newWeight,
          totalPrice: data.basePrice * newWeight,
        });
      } else {
        Object.assign(data, {
          boxAmount: batch.boxAmount,
          quantity: batch.quantity,
          totalWeightInKg: batch.weightInKg,
          totalPrice: data.basePrice * batch.weightInKg,
        });
      }

      map.set(key, data);
    }

    const response = GetAnalyticalToExpiresByCompanyResponseDto.fromMap(map);

    return response;
  }

  async getAnalyticalStockData(companyCode: string) {
    const company = await this.companyRepository.findOne({
      where: {
        sensattaCode: companyCode,
      },
    });
    const data = {
      companyCode: company.sensattaCode,
      companyName: company.name,
    };

    const [stockData, toExpiresData] = await Promise.all([
      this.getAnalyticalStockByCompany(company.sensattaCode, {
        company,
      }),
      this.getAnalyticalToExpiresByCompany(company.sensattaCode, {
        company,
      }),
    ]);

    return {
      ...data,
      stockData: stockData,
      toExpiresData: toExpiresData,
    };
  }
}
