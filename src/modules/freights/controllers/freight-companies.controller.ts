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

@Controller('freights/freight-companies')
export class FreightCompaniesController {
  constructor(private readonly service: FreightCompaniesService) {}

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
