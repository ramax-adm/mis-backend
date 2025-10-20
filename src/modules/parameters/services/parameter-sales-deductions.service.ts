import { MarketEnum } from '@/core/enums/sensatta/markets.enum';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, ILike } from 'typeorm';
import { CreateParameterSalesDeductionRequestDto } from '../dtos/request/create-parameter-sales-deduction-request.dto';
import { UpdateParameterSalesDeductionRequestDto } from '../dtos/request/update-parameter-sales-deduction-request.dto';

@Injectable()
export class ParameterSalesDeductionsService {
  constructor(private readonly datasource: DataSource) {}

  // async create(
  //   userId: string,
  //   {
  //     name,
  //     companyCode,
  //     market,
  //     value,
  //     unit,
  //   }: CreateParameterSalesDeductionRequestDto,
  // ) {
  //   return await this.datasource.manager.save(ParameterSalesDeduction, {
  //     name,
  //     companyCode,
  //     market,
  //     value,
  //     unit,
  //     createdById: userId,
  //   });
  // }

  // async find({
  //   name,
  //   companyCode,
  //   market,
  // }: {
  //   name: string;
  //   companyCode: string;
  //   market: MarketEnum;
  // }) {
  //   const data = await this.datasource.manager.find(ParameterSalesDeduction, {
  //     where: {
  //       name: ILike(`${name}`),
  //       companyCode,
  //       market,
  //     },
  //   });

  //   return data;
  // }

  // async update(
  //   id: string,
  //   userId: string,
  //   {
  //     name,
  //     companyCode,
  //     market,
  //     value,
  //     unit,
  //   }: UpdateParameterSalesDeductionRequestDto,
  // ) {
  //   const previousData = await this.datasource.manager.findOne(
  //     ParameterSalesDeduction,
  //     { where: { id } },
  //   );

  //   if (!previousData) {
  //     throw new NotFoundException('O registro nao pode ser encontrado');
  //   }

  //   const toUpdateData = this.datasource.manager.merge(
  //     ParameterSalesDeduction,
  //     previousData,
  //     {
  //       name,
  //       companyCode,
  //       market,
  //       value,
  //       unit,
  //       updatedById: userId,
  //     },
  //   );

  //   return await this.datasource.manager.save(
  //     ParameterSalesDeduction,
  //     toUpdateData,
  //   );
  // }

  // async remove(id: string, userId: string) {
  //   return await this.datasource.manager.save(ParameterSalesDeduction, {
  //     id,
  //     updatedById: userId,
  //     deleletById: userId,
  //   });
  // }

  // async addParameterProductLine({
  //   paramSaleDeductionId,
  //   productLineId,
  // }: {
  //   paramSaleDeductionId: string;
  //   productLineId: string;
  // }) {
  //   const relationAlreadyExists = await this.datasource.manager.findOne(
  //     ParameterSalesDeductionProductLine,
  //     {
  //       where: {
  //         paramSaleDeductionId,
  //         productLineId,
  //       },
  //     },
  //   );

  //   if (relationAlreadyExists) {
  //     throw new ConflictException(
  //       'A Relação ja existe previamente no sensatta',
  //     );
  //   }

  //   return await this.datasource.manager.save(
  //     ParameterSalesDeductionProductLine,
  //     {
  //       paramSaleDeductionId,
  //       productLineId,
  //     },
  //   );
  // }

  // async removeParameterProductLine(id: string) {
  //   const relationExists = await this.datasource.manager.findOne(
  //     ParameterSalesDeductionProductLine,
  //     {
  //       where: {
  //         id,
  //       },
  //     },
  //   );

  //   if (!relationExists) {
  //     throw new NotFoundException('Essa relação não existe');
  //   }

  //   return await this.datasource.manager.delete(
  //     ParameterSalesDeductionProductLine,
  //     {
  //       id,
  //     },
  //   );
  // }
}
