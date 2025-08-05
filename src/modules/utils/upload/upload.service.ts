import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { UploadFileInput } from '../dtos/upload-file-inputs.dto';
import { UploadTypeEnum } from '../enums/upload-type.enum';
import { Repository } from 'typeorm';
import { UploadFile } from '../entities/upload-file.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UploadedFile } from '../entities/uploaded-files.entity';
import { UploadInputIdEnum } from '../enums/upload-input-id.enum';
import { Company } from '@/core/entities/sensatta/company.entity';
import { UploadFileService } from './upload-file.service';

@Injectable()
export class UploadService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(UploadFile)
    private readonly uploadFileRepository: Repository<UploadFile>,
    @InjectRepository(UploadedFile)
    private readonly uploadedFileRepository: Repository<UploadedFile>,
    @Inject(forwardRef(() => UploadFileService))
    private readonly uploadFileService: UploadFileService,
  ) {}

  async getInputOptions(inputId: UploadInputIdEnum) {
    const response: {
      key: string;
      label: string;
      value: string | number;
    }[] = [];

    switch (inputId) {
      case UploadInputIdEnum.COMPANY: {
        const companies = await this.companyRepository.find();

        companies
          .sort((a, b) => Number(a.sensattaCode) - Number(b.sensattaCode))
          .forEach((item) =>
            response.push({
              key: item.sensattaCode,
              label: `${item.sensattaCode} - ${item.name}`,
              value: item.sensattaCode,
            }),
          );
        break;
      }

      case UploadInputIdEnum.INTEGRATION_SYSTEM: {
        response.push(
          {
            key: 'DATAVALE',
            label: `DATAVALE`,
            value: 'DATAVALE',
          },
          {
            key: 'SECULLUM',
            label: 'SECULLUM',
            value: 'SECULLUM',
          },
        );
      }
      default: {
        break;
      }
    }
    return response;
  }

  async findOne(type: UploadTypeEnum) {
    return await this.uploadFileRepository.findOneBy({ type });
  }

  async findAll() {
    return await this.uploadFileRepository.find();
  }

  async saveUploadedFile(data: Partial<UploadedFile>) {
    return await this.uploadedFileRepository.save(data);
  }

  async upload(
    dto: any,
    file: Express.Multer.File,
    uploadType: UploadTypeEnum,
  ) {
    return await this.uploadFileService.execute(dto, file, uploadType);
    // switch (uploadType) {
    //   case UploadTypeEnum.EXTERNAL_BATCHES:
    //     return await this.uploadExternalIncomingBatchesService.execute(
    //       dto,
    //       file,
    //     );
    //   default:
    //     throw new BadRequestException('Tipo de upload invalido');
    // }
  }
}
