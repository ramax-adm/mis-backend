import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/user-roles.guard';
import { UploadInputIdEnum } from '@/modules/utils/enums/upload-input-id.enum';
import { UploadTypeEnum } from '@/modules/utils/enums/upload-type.enum';
import { UploadService } from '@/modules/utils/upload/upload.service';
import {
  Body,
  Controller,
  forwardRef,
  Get,
  Inject,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('upload')
export class UploadController {
  constructor(
    @Inject(forwardRef(() => UploadService))
    private readonly uploadService: UploadService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async findAll() {
    return await this.uploadService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':type')
  async findByType(@Param('type') type: UploadTypeEnum) {
    const uploadFile = await this.uploadService.findOne(type);
    const inputs = [];

    const uploadFilesHasInputs =
      uploadFile?.inputs && uploadFile?.inputs.length > 0;
    if (uploadFilesHasInputs) {
      for (const input of uploadFile.inputs) {
        const options = await this.uploadService.getInputOptions(
          input.id as UploadInputIdEnum,
        );

        inputs.push({
          id: input.id,
          type: input.type,
          label: input.label,
          options,
        });
      }
    }

    return {
      uploadFile,
      inputs,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/inputs/:inputId')
  async getInputOptions(@Param('inputId') inputId: UploadInputIdEnum) {
    return await this.uploadService.getInputOptions(inputId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':uploadType')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: any,
    @Param('uploadType') uploadType: UploadTypeEnum,
  ) {
    return await this.uploadService.upload(dto, file, uploadType);
  }
}
