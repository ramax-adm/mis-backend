import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { UploadedFile } from '../entities/uploaded-files.entity';
import { HttpService } from '@nestjs/axios';
import { EnvService } from '@/config/env/env.service';
import * as FormData from 'form-data'; // <- esta é a lib correta para Node.js
import { UploadService } from './upload.service';
import { UploadTypeEnum } from '../enums/upload-type.enum';

const NOT_UPLOAD_KEYS = ['type', 'file', 'url'];

@Injectable()
export class UploadFileService {
  constructor(
    @Inject(forwardRef(() => UploadService))
    private readonly uploadService: UploadService,
    private readonly envService: EnvService,
    private readonly httpService: HttpService,
  ) {}

  async execute(
    dto: any,
    file: Express.Multer.File,
    uploadType: UploadTypeEnum,
  ) {
    const url = dto?.url;
    if (!uploadType || !url) {
      throw new BadRequestException('Forneça o tipo de upload e sua URL');
    }

    const serverUrlCall = this.envService.get('SERVER_API_URL').concat(url);
    const formData = new FormData();
    formData.append('file', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });

    const dtoKeys = Object.keys(dto);
    for (const key of dtoKeys) {
      if (NOT_UPLOAD_KEYS.includes(key)) {
        continue;
      }
      formData.append(key, dto[key]);
    }

    await this.httpService.axiosRef.post(serverUrlCall, formData, {
      headers: formData.getHeaders(), // Importante para axios entender o boundary do FormData
      timeout: 30 * 1000,
    });

    const uploadFile: Partial<UploadedFile> = {
      fileSizeUnit: 'bytes',
      syncName: uploadType,
      fileName: file.originalname,
      fileSize: file.size,
      extension: file.originalname.split('.')[1],
    };
    await this.uploadService.saveUploadedFile(uploadFile);
  }
}
