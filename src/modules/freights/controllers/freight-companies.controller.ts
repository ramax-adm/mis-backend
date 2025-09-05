import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpException,
  HttpStatus,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { FreightCompaniesService } from '../services/freight-companies.service';
import { H } from 'vitest/dist/chunks/reporters.d.CqBhtcTq';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/user-roles.guard';
import { FreightCompany } from '@/core/entities/sensatta/freight-company.entity';
import { DataSource } from 'typeorm';

@Controller('freights/freight-companies')
export class FreightCompaniesController {
  constructor(
    private readonly datasource: DataSource,
    private readonly service: FreightCompaniesService,
  ) {}

  @Get('filters/freight-company')
  async getFreightCompanies() {
    const data = await this.datasource
      .getRepository(FreightCompany)
      .find({ order: { name: 'ASC' } });

    return data.map((i) => ({
      key: i.sensattaCode,
      label: i.name,
      value: i.sensattaCode,
    }));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.service.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
