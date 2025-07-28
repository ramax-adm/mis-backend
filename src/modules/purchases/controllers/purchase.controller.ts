import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/user-roles.guard';
import { CattlePurchaseService } from '@/modules/purchases/services/cattle-purchase.service';
import { GetCattlePurchaseLastUpdatedAtResponseDto } from '@/modules/purchases/dtos/get-cattle-purchase-last-updated-at-response.dto';
import { Controller, Get, HttpCode, UseGuards } from '@nestjs/common';
@Controller('purchase')
export class PurchaseController {
  constructor(private readonly cattlePurchaseService: CattlePurchaseService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/last-update')
  @HttpCode(200)
  async getStockLastUpdatedAt() {
    const response =
      await this.cattlePurchaseService.getCattlePurchaseLastUpdatedAt();

    return GetCattlePurchaseLastUpdatedAtResponseDto.create(response).toJSON();
  }
}
