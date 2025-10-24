import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/user-roles.guard';
import { SYNCED_FILE_ENTITIES } from '@/modules/utils/constants/get-synced-file-entity';
import { UNIT_TYPES } from '@/modules/utils/constants/unit-types';
import { UtilsService } from '@/modules/utils/utils.service';
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';

@Controller('utils')
export class UtilsController {
  constructor(private readonly utilsService: UtilsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/synced-files')
  async getSyncedFiles(
    @Query('date') date?: Date,
    @Query('entity') entity?: string,
  ) {
    const response = await this.utilsService.getSyncedFiles({ date, entity });

    return response.map((item) => item.toJSON());
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/synced-files/entity')
  getEntities() {
    return SYNCED_FILE_ENTITIES.sort((a, b) =>
      a.label.localeCompare(b.label, undefined, { numeric: true }),
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/synced-files/:id/signed-url')
  async getSyncedFileSignedUrl(@Param('id') id: string) {
    const response = await this.utilsService.getSyncedFileSignedUrl({ id });

    return response;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/unit-types')
  async getUnitTypes() {
    return UNIT_TYPES;
  }
}
