import { AppWebpage } from '@/core/entities/application/app-webpage.entity';
import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller('application')
export class ApplicationController {
  constructor(private readonly datasource: DataSource) {}

  @Get('webpages')
  @HttpCode(HttpStatus.OK)
  getAppWebpages() {
    return this.datasource.manager.find(AppWebpage);
  }
}
