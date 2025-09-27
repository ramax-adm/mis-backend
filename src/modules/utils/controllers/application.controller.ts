import { AppWebpage } from '@/core/entities/application/app-webpage.entity';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/user-roles.guard';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller('application')
export class ApplicationController {
  constructor(private readonly datasource: DataSource) {}

  // @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('webpages')
  @HttpCode(HttpStatus.OK)
  getAppWebpages() {
    return this.datasource.manager.find(AppWebpage);
  }
}
