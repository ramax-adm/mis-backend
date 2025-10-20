import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { StringUtils } from '../../utils/services/string.utils';
import { GetStockByCompanyResponseDto } from '../dtos/response/stock-get-by-company-response.dto';
import { GetToExpiresByCompanyResponseDto } from '../dtos/response/stock-get-to-expires-by-company-response.dto';
import { DateUtils } from '../../utils/services/date.utils';
import {
  GetExternalIncomingBatchesQueryResponse,
  GetIncomingBatchesQueryResponse,
  StockOptionalData,
} from '../types/stock.types';
import { GetStockLastUpdatedAtResponseDto } from '../dtos/response/stock-get-last-updated-at-response.dto';
import { Company } from '@/core/entities/sensatta/company.entity';
import { IncomingBatches } from '@/modules/stock/entities/incoming-batch.entity';
import { ReferencePrice } from '@/modules/stock/entities/reference-price.entity';
import { StockUtilsService } from './stock-utils.service';
import { INCOMING_BATCHES_QUERY } from '../constants/stock-incoming-batches-query';
import { GetAnalyticalStockByCompanyResponseDto } from '../dtos/response/stock-get-analytical-by-company-response.dto';
import { GetAnalyticalToExpiresByCompanyResponseDto } from '../dtos/response/stock-get-analytical-to-expires-by-company-response.dto';
import { EXTERNAL_INCOMING_BATCHES_QUERY } from '../constants/external-incoming-batches-query';
import { ExternalIncomingBatch } from '@/core/entities/external/external-incoming-batch.entity';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(ReferencePrice)
    private readonly referencePriceRepository: Repository<ReferencePrice>,
    @InjectRepository(IncomingBatches)
    private readonly incomingBatchesRepository: Repository<IncomingBatches>,
    @InjectRepository(ExternalIncomingBatch)
    private readonly externalIncomingBatchesRepository: Repository<ExternalIncomingBatch>,
    private readonly dataSource: DataSource,
    private readonly stockUtilsService: StockUtilsService,
  ) {}

  // Busca o valor de quando o registro foi recriado no banco
  async getStockLastUpdatedAt() {
    const [entryBatch] = await this.incomingBatchesRepository.find({ take: 1 });
    const [entryExternalBatch] =
      await this.externalIncomingBatchesRepository.find({ take: 1 });

    // Toda vez que eu atualizo os dados (dou carga novamente) o dado é recriado
    return {
      updatedAt: entryBatch.createdAt,
      externalUpdatedAt: entryExternalBatch.createdAt,
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

  // get external incoming batches ->
  async getExternalIncomingBatchesData(company: Company) {
    // constants
    const query = EXTERNAL_INCOMING_BATCHES_QUERY;
    const companyCode = company.sensattaCode;

    const result = await this.dataSource.query<
      GetExternalIncomingBatchesQueryResponse[]
    >(query, [companyCode]);
    return result;
  }

  // Retorna os dados de preço de referencia
  async getReferencePricesData({ company }: { company: Company }) {
    return await this.referencePriceRepository.find({
      where: {
        companyCode: company.sensattaCode,
        mainTableNumber: In([
          company.priceTableNumberCar,
          company.priceTableNumberTruck,
        ]),
      },
    });
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
      externalIncomingBatchesWithRelations: externalIncomeBatches,
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
      [incomingBatches, externalIncomeBatches, refPrices] = await Promise.all([
        this.getIncomingBatchesData(company),
        // external incoming batches
        this.getExternalIncomingBatchesData(company),
        this.getReferencePricesData({ company }),
      ]);
    }

    const map = new Map<string, any>();

    for (const batch of incomingBatches) {
      if (!batch.productCode) {
        continue;
      }

      // Preco base
      const { price: basePriceCar } = refPrices.find(
        (item) =>
          item.mainTableNumber == company.priceTableNumberCar &&
          item.productId == batch.productId,
      ) ?? { price: 0 };

      const { price: basePriceTruck } = refPrices.find(
        (item) =>
          item.mainTableNumber == company.priceTableNumberTruck &&
          item.productId == batch.productId,
      ) ?? { price: 0 };

      const hasPreviousValues = map.has(batch.productCode);

      const data = {
        companyName: company?.name,
        productLineAcronym: batch.productLineAcronym,
        productLineName: batch.productLineName,
        productName: batch.productName,
        productClassification: batch.productClassification,
        basePriceCar,
        basePriceTruck,
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
          totalPrice: data.basePriceCar * newWeight,
        });
      } else {
        Object.assign(data, {
          boxAmount: batch.boxAmount,
          quantity: batch.quantity,
          totalWeightInKg: batch.weightInKg,
          totalPrice: data.basePriceCar * batch.weightInKg,
        });
      }

      map.set(batch.productCode, data);
    }

    for (const batch of externalIncomeBatches) {
      if (!batch.productCode) {
        continue;
      }

      // Preco base
      const { price: basePriceCar } = refPrices.find(
        (item) =>
          item.mainTableNumber == company.priceTableNumberCar &&
          item.productId == batch.productId,
      ) ?? { price: 0 };

      const { price: basePriceTruck } = refPrices.find(
        (item) =>
          item.mainTableNumber == company.priceTableNumberTruck &&
          item.productId == batch.productId,
      ) ?? { price: 0 };

      const hasPreviousValues = map.has(batch.productCode);

      const data = {
        companyName: company?.name,
        productLineAcronym: batch.productLineAcronym,
        productLineName: batch.productLineName,
        productName: batch.productName,
        productClassification: batch.productClassification,
        basePriceCar,
        basePriceTruck,
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
          totalPrice: data.basePriceCar * newWeight,
        });
      } else {
        Object.assign(data, {
          boxAmount: batch.boxAmount,
          quantity: batch.quantity,
          totalWeightInKg: batch.weightInKg,
          totalPrice: data.basePriceCar * batch.weightInKg,
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
      externalIncomingBatchesWithRelations: externalIncomeBatches,
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
      externalIncomeBatches =
        await this.getExternalIncomingBatchesData(company);
      // external incoming batches
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

    for (const batch of externalIncomeBatches) {
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

    companies.sort((a, b) => Number(a.sensattaCode) - Number(b.sensattaCode));

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

    const [incomingBatches, externalIncomeBatches, refPrices] =
      await Promise.all([
        this.getIncomingBatchesData(company),
        this.getExternalIncomingBatchesData(company),
        this.getReferencePricesData({ company }),
      ]);

    const map = new Map<string, any>();
    for (const batch of incomingBatches) {
      if (!batch.productCode) {
        continue;
      }

      // Preco base
      const { price: basePriceCar } = refPrices.find(
        (item) =>
          item.mainTableNumber == company.priceTableNumberCar &&
          item.productId == batch.productId,
      ) ?? { price: 0 };

      const { price: basePriceTruck } = refPrices.find(
        (item) =>
          item.mainTableNumber == company.priceTableNumberTruck &&
          item.productId == batch.productId,
      ) ?? { price: 0 };

      const allPricesByState = this.stockUtilsService.getPriceMap(
        batch,
        companyCode,
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
        basePriceCar,
        basePriceTruck,
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
          totalPrice: data.basePriceCar * newWeight,
        });
      } else {
        Object.assign(data, {
          boxAmount: batch.boxAmount,
          quantity: batch.quantity,
          totalWeightInKg: batch.weightInKg,
          totalPrice: data.basePriceCar * batch.weightInKg,
        });
      }

      map.set(batch.productCode, data);
    }

    for (const batch of externalIncomeBatches) {
      if (!batch.productCode) {
        continue;
      }

      // Preco base
      const { price: basePriceCar } = refPrices.find(
        (item) =>
          item.mainTableNumber == company.priceTableNumberCar &&
          item.productId == batch.productId,
      ) ?? { price: 0 };

      const { price: basePriceTruck } = refPrices.find(
        (item) =>
          item.mainTableNumber == company.priceTableNumberTruck &&
          item.productId == batch.productId,
      ) ?? { price: 0 };

      const allPricesByState = this.stockUtilsService.getPriceMap(
        batch,
        companyCode,
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
        basePriceCar,
        basePriceTruck,
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
          totalPrice: data.basePriceCar * newWeight,
        });
      } else {
        Object.assign(data, {
          boxAmount: batch.boxAmount,
          quantity: batch.quantity,
          totalWeightInKg: batch.weightInKg,
          totalPrice: data.basePriceCar * batch.weightInKg,
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

    const [incomingBatches, externalIncomeBatches, refPrices] =
      await Promise.all([
        this.getIncomingBatchesData(company),
        // external incoming batches
        this.getExternalIncomingBatchesData(company),
        this.getReferencePricesData({ company }),
      ]);

    const map = new Map<string, any>();

    for (const batch of incomingBatches) {
      if (!batch.productCode) {
        continue;
      }
      // Preco base
      const { price: basePriceCar } = refPrices.find(
        (item) =>
          item.mainTableNumber == company.priceTableNumberCar &&
          item.productId == batch.productId,
      ) ?? { price: 0 };

      const { price: basePriceTruck } = refPrices.find(
        (item) =>
          item.mainTableNumber == company.priceTableNumberTruck &&
          item.productId == batch.productId,
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
        basePriceCar,
        basePriceTruck,
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
          totalPrice: data.basePriceCar * newWeight,
        });
      } else {
        Object.assign(data, {
          boxAmount: batch.boxAmount,
          quantity: batch.quantity,
          totalWeightInKg: batch.weightInKg,
          totalPrice: data.basePriceCar * batch.weightInKg,
        });
      }

      map.set(key, data);
    }

    for (const batch of externalIncomeBatches) {
      if (!batch.productCode) {
        continue;
      }
      // Preco base
      const { price: basePriceCar } = refPrices.find(
        (item) =>
          item.mainTableNumber == company.priceTableNumberCar &&
          item.productId == batch.productId,
      ) ?? { price: 0 };

      const { price: basePriceTruck } = refPrices.find(
        (item) =>
          item.mainTableNumber == company.priceTableNumberTruck &&
          item.productId == batch.productId,
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
        basePriceCar,
        basePriceTruck,
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
          totalPrice: data.basePriceCar * newWeight,
        });
      } else {
        Object.assign(data, {
          boxAmount: batch.boxAmount,
          quantity: batch.quantity,
          totalWeightInKg: batch.weightInKg,
          totalPrice: data.basePriceCar * batch.weightInKg,
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
