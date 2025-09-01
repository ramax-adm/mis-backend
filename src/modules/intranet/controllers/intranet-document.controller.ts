import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { IntranetDocumentService } from '../services/intranet-document.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/user-roles.guard';
import { CurrentUser } from '@/core/decorators/current-user.decorator';
import { User } from '@/modules/user/entities/user.entity';
import { CreateIntranetDocumentRequestDto } from '../dtos/request/create-intranet-document-request.dto';
import { CreateIntranetDocumentVersionRequestDto } from '../dtos/request/create-intranet-document-version-request.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { IntranetDocumentTypeEnum } from '../enums/intranet-document-type.enum';
import { UpdateIntranetDocumentRequestDto } from '../dtos/request/update-intranet-document-request.dto';
import { IntranetDocumentReportService } from '../services/intranet-document-report.service';
import { Response } from 'express';

@Controller('intranet/document')
export class IntranetDocumentController {
  constructor(
    private intranetDocumentService: IntranetDocumentService,
    private intranetDocumentReportService: IntranetDocumentReportService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreateIntranetDocumentRequestDto,
    @CurrentUser() user: User,
  ) {
    return this.intranetDocumentService.create(dto, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Post('version')
  @HttpCode(HttpStatus.CREATED)
  createVersion(
    @Body() dto: CreateIntranetDocumentVersionRequestDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    return this.intranetDocumentService.createVersion(dto, file, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('versions')
  @HttpCode(HttpStatus.OK)
  findDocumentVersions() {
    return this.intranetDocumentService.findDocumentVersions();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('versions/:id')
  @HttpCode(HttpStatus.OK)
  findOneDocumentVersion(@Param('id') id: string) {
    return this.intranetDocumentService.findOneDocumentVersion(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('get-user-documents')
  @HttpCode(HttpStatus.OK)
  getUserDocumentsData(
    @CurrentUser() user: User,
    @Query('type') type?: IntranetDocumentTypeEnum,
  ) {
    return this.intranetDocumentService.getUserDocumentsData({
      type,
      userId: user.id,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('get-accepted-documents')
  @HttpCode(HttpStatus.OK)
  getAcceptedDocuments(@CurrentUser() user: User) {
    return this.intranetDocumentService.getAcceptedDocuments();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('get-pending-acceptance-documents')
  @HttpCode(HttpStatus.OK)
  getPendingAcceptanceDocuments() {
    return this.intranetDocumentService.getPendingAcceptanceDocuments();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  @HttpCode(HttpStatus.OK)
  find() {
    return this.intranetDocumentService.find();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.intranetDocumentService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  updateDocument(
    @Param('id') id: string,
    @Body() dto: UpdateIntranetDocumentRequestDto,
  ) {
    return this.intranetDocumentService.updateDocument(id, dto);
  }

  // TEMPORARIO
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/export-xlsx')
  @HttpCode(HttpStatus.OK)
  async exportXLSX(@Res() res: Response, @CurrentUser() user: User) {
    const result = await this.intranetDocumentReportService.export(user.id);

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    res.header(
      'Content-Disposition',
      `attachment; filename=${formattedDate}-intranet.xlsx`,
    );
    res.type(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    console.log('sending');

    res.send(result);
  }
}
