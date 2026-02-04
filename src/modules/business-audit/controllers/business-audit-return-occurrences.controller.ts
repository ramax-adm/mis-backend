import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { BusinessAuditOverviewService } from '../services/business-audit-overview.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/user-roles.guard';
import { DataSource } from 'typeorm';
import { BusinessAuditReturnOccurrencesService } from '../services/business-audit-return-occurrences.service';
import { ReturnOccurrence } from '@/modules/sales/entities/return-occurrence.entity';
import { BusinessAuditSalesService } from '../services/business-audit-sales.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('business-audit/return-occurrences')
export class BusinessAuditReturnOccurrencesController {
  constructor(
    private readonly dataSource: DataSource,
    private readonly businessAuditSalesService: BusinessAuditSalesService,
    private readonly businessAuditReturnOccurrencesService: BusinessAuditReturnOccurrencesService,
  ) {}

  @Get('filters/causes')
  @HttpCode(HttpStatus.OK)
  async getReturnOccurrencesCauses() {
    const results = await this.dataSource
      .getRepository(ReturnOccurrence)
      .createQueryBuilder('ro')
      .select(['ro.occurrenceCause'])
      .distinctOn(['ro.occurrenceCause'])
      .getMany();
    return results.map((i) => ({
      key: i.occurrenceCause,
      label: i.occurrenceCause,
      value: i.occurrenceCause,
    }));
  }

  @Get('filters/clients')
  @HttpCode(HttpStatus.OK)
  async getClients() {
    const results = await this.businessAuditSalesService.getClients();
    return results.map((i) => ({
      key: i.so_client_code,
      label: i.so_client_name,
      value: i.so_client_code,
    }));
  }

  @Get('filters/sales-representatives')
  @HttpCode(HttpStatus.OK)
  async getSalesRepresentatives() {
    // dos dados que ja foram filtrados, pego apenas o set de clientes
    const results = await this.businessAuditSalesService.getRepresentatives();
    return results.map((i) => ({
      key: i.so_sales_representative_code,
      label: i.so_sales_representative_name,
      value: i.so_sales_representative_code,
    }));
  }

  // @Get('filters/clients')
  // @HttpCode(HttpStatus.OK)
  // async getClients() {
  //   const results = await this.dataSource
  //     .getRepository(ReturnOccurrence)
  //     .createQueryBuilder('ro')
  //     .select(['ro.clientCode', 'ro.clientName'])
  //     .distinctOn(['ro.clientCode'])
  //     .orderBy('ro.clientCode', 'ASC')
  //     .addOrderBy('ro.clientName', 'ASC')
  //     .getMany();

  //   return results
  //     .sort((a, b) => a.clientName?.localeCompare(b.clientName, 'pt-br'))
  //     .map((i) => ({
  //       key: i.clientCode,
  //       label: i.clientName,
  //       value: i.clientCode,
  //     }));
  // }

  // @Get('filters/sales-representatives')
  // @HttpCode(HttpStatus.OK)
  // async getSalesRepresentatives() {
  //   const results = await this.dataSource
  //     .getRepository(ReturnOccurrence)
  //     .createQueryBuilder('ro')
  //     .select(['ro.salesRepresentativeCode', 'ro.salesRepresentativeName'])
  //     .distinctOn(['ro.salesRepresentativeCode'])
  //     .orderBy('ro.salesRepresentativeCode', 'ASC')
  //     .addOrderBy('ro.salesRepresentativeName', 'ASC')
  //     .getMany();

  //   return results
  //     .sort((a, b) =>
  //       a.salesRepresentativeName?.localeCompare(
  //         b.salesRepresentativeName,
  //         'pt-br',
  //       ),
  //     )
  //     .map((i) => ({
  //       key: i.salesRepresentativeCode,
  //       label: i.salesRepresentativeName,
  //       value: i.salesRepresentativeCode,
  //     }));
  // }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getReturnOccurrencesAuditData(
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('occurrenceNumber') occurrenceNumber?: string,
    @Query('companyCodes') companyCodes?: string,
    @Query('occurrenceCauses') occurrenceCauses?: string,
    @Query('returnType') returnType?: string,
    @Query('clientCodes') clientCodes?: string,
    @Query('representativeCodes') representativeCodes?: string,
  ) {
    return await this.businessAuditReturnOccurrencesService.getReturnOccurrencesAuditData(
      {
        startDate,
        endDate,
        occurrenceNumber,
        companyCodes: companyCodes?.split(','),
        occurrenceCauses: occurrenceCauses?.split(','),
        returnType,
        clientCodes: clientCodes?.split(','),
        representativeCodes: representativeCodes?.split(','),
      },
    );
  }

  @Get(':occurrenceNumber')
  @HttpCode(HttpStatus.OK)
  async getOneReturnOccurrence(
    @Param('occurrenceNumber') occurrenceNumber?: string,
  ) {
    return await this.businessAuditReturnOccurrencesService.getReturnOccurrences(
      {
        occurrenceNumber,
      },
    );
  }
}
