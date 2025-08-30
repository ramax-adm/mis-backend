import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/user-roles.guard';
import { UserIntranetDocumentAcceptanceService } from '../services/user-intranet-document-acceptance.service';
import { CurrentUser } from '@/core/decorators/current-user.decorator';
import { User } from '../entities/user.entity';

@Controller('user/user-intranet-document-acceptance')
export class UserIntranetDocumentAcceptanceController {
  constructor(
    private readonly userIntranetDocumentAcceptanceService: UserIntranetDocumentAcceptanceService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  addUserIntranetDocumentAcceptance(
    @Body()
    dto: {
      documentVersionId: string;
      ipAddress: string;
      acceptanceTimeInSeconds: number;
    },
    @CurrentUser() user: User,
  ) {
    return this.userIntranetDocumentAcceptanceService.create({
      ...dto,
      userId: user.id,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeUserIntranetDocumentAcceptance(@Param('id') id: string) {
    return this.userIntranetDocumentAcceptanceService.remove({ id });
  }
}
