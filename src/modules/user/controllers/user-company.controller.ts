import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CurrentUser } from '@/core/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { User } from '@/modules/user/entities/user.entity';
import { RolesGuard } from '@/modules/auth/guards/user-roles.guard';
import { UserSensattaCompanyService } from '../services/user-sensatta-company.service';

@Controller('user/user-company')
export class UserSensattaCompanyController {
  constructor(
    private readonly userCompanyService: UserSensattaCompanyService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  addUserCompany(@Body() dto: { userId: string; companyCode: string }) {
    return this.userCompanyService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('by-user')
  @HttpCode(HttpStatus.OK)
  findByUser(
    @CurrentUser() user: User,
    @Query('isConsideredOnStock') isConsideredOnStock?: boolean,
  ) {
    return this.userCompanyService.findByUser({
      user,
      isConsideredOnStock,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeUserCompany(@Param('id') id: string) {
    return this.userCompanyService.remove({ id });
  }
}
