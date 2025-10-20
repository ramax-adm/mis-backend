import { MarketEnum } from '@/core/enums/sensatta/markets.enum';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateParameterSalesDeductionRequestDto } from '../dtos/request/create-parameter-sales-deduction-request.dto';
import { ParameterSalesDeductionsService } from '../services/parameter-sales-deductions.service';
import { CurrentUser } from '@/core/decorators/current-user.decorator';
import { User } from '@/modules/user/entities/user.entity';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/user-roles.guard';
import { UpdateParameterSalesDeductionRequestDto } from '../dtos/request/update-parameter-sales-deduction-request.dto';

@Controller('params/sales-deduction')
export class ParameterSalesDeductionsController {
  constructor(
    private readonly parameterSalesDeductionsService: ParameterSalesDeductionsService,
  ) {}
  // criar parametros
  // listar parametros c/ filtro
  // atualizar parametro
  // remover parametro

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Post()
  // @HttpCode(HttpStatus.CREATED)
  // create(
  //   @Body() dto: CreateParameterSalesDeductionRequestDto,
  //   @CurrentUser() user: User,
  // ) {
  //   return this.parameterSalesDeductionsService.create(user.id, dto);
  // }

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Get()
  // @HttpCode(HttpStatus.OK)
  // find(
  //   @Query('companyCode') companyCode: string,
  //   @Query('market') market: MarketEnum,
  //   @Query('name') name: string = '',
  // ) {
  //   return this.parameterSalesDeductionsService.find({
  //     companyCode,
  //     market,
  //     name,
  //   });
  // }

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Patch(':id')
  // @HttpCode(HttpStatus.OK)
  // update(
  //   @Param('id') id: string,
  //   @CurrentUser() user: User,
  //   @Body() dto: UpdateParameterSalesDeductionRequestDto,
  // ) {
  //   return this.parameterSalesDeductionsService.update(id, user.id, dto);
  // }

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Post('product-line')
  // addParameterProductLine(
  //   @Body() dto: { paramSaleDeductionId: string; productLineId: string },
  // ) {
  //   return this.parameterSalesDeductionsService.addParameterProductLine(dto);
  // }

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Delete('product-line')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // removeParameterProductLine(@Param('id') id: string) {
  //   return this.parameterSalesDeductionsService.removeParameterProductLine(id);
  // }
}
