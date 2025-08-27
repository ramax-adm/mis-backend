import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { IntranetDocument } from '../entities/intranet-document.entity';
import { CreateIntranetDocumentRequestDto } from '../dtos/request/create-intranet-document-request.dto';
import { S3StorageService, STORAGE_SERVICE_PROVIDER } from '@/modules/aws';
import { CreateIntranetDocumentVersionRequestDto } from '../dtos/request/create-intranet-document-version-request.dto';
import { IntranetDocumentVersion } from '../entities/intranet-document-version.entity';
import { FileUtils } from '@/modules/utils/services/file.utils';
import { User } from '@/modules/user/entities/user.entity';
import { FindIntranetDocumentsRawItem } from '../types/find-intranet-documents.type';
import { StorageTypesEnum } from '@/modules/utils/enums/storage-types.enum';
import { EnvService } from '@/config/env/env.service';

const BUCKET_KEY = 'intranet-documents';

@Injectable()
export class IntranetDocumentService {
  constructor(
    @Inject(STORAGE_SERVICE_PROVIDER)
    private readonly storageService: S3StorageService,
    private readonly envService: EnvService,
    private readonly datasource: DataSource,
  ) {}

  // cadastro de documentos
  async create(dto: CreateIntranetDocumentRequestDto, userId: string) {
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const data = await queryRunner.manager.save(IntranetDocument, {
        ...dto,
        createdById: userId,
      });
      await queryRunner.commitTransaction();
      return data;
    } catch (error) {
      console.log(error);
      // chamada para repositorio de log
      await queryRunner.rollbackTransaction();

      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // cadastro de uma versão de documento
  async createVersion(
    dto: CreateIntranetDocumentVersionRequestDto,
    file: Express.Multer.File,
    userId: string,
  ) {
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // buscar se existe o intranet document
      const document = await queryRunner.manager.find(IntranetDocument, {
        where: { id: dto.documentId },
      });

      if (!document) {
        throw new NotFoundException('O Documento não pode ser encontrado');
      }

      let extension: string | undefined,
        storageKey: string | undefined,
        storageType: StorageTypesEnum | undefined = undefined;

      const isDocumentType = dto.type === 'document';
      if (isDocumentType) {
        extension = this.getFileExtension(file.originalname);
        storageType = this.getS3StorageType();
        storageKey = this.getS3Key(file.originalname);
        // salvar o file no storage
        await this.storageService.upload({
          Bucket: this.envService.get('AWS_S3_BUCKET'),
          Key: storageKey,
          Body: file.buffer,
        });
      }

      // salvar metadados no banco
      const data = await queryRunner.manager.save(IntranetDocumentVersion, {
        ...dto,
        extension,
        storageKey,
        storageType,
        createdById: userId,
      });
      await queryRunner.commitTransaction();
      return data;
    } catch (error) {
      console.log(error);
      // chamada para repositorio de log
      await queryRunner.rollbackTransaction();

      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // listagem de documentos + status do usuario
  async find() {
    return await this.datasource.manager.find(IntranetDocument);
  }

  async findOne(id: string) {
    return await this.datasource.manager.findOne(IntranetDocument, {
      where: { id },
      relations: { versions: true },
    });
  }

  async findDocumentVersions() {
    return await this.datasource.manager.find(IntranetDocumentVersion, {
      relations: {
        document: true,
        createdBy: true,
      },
    });
  }

  async findOneDocumentVersion(id: string) {
    return await this.datasource.manager.findOne(IntranetDocumentVersion, {
      where: { id },
      relations: {
        document: true,
        createdBy: true,
      },
    });
  }

  async findByUser(userId: string) {
    const user = await this.datasource.manager.find(User, {
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario nao encontrado');
    }

    // qb para pegar todos os documentos
    // e pegar a ultima versao de cada um deles
    // e pegar se o user atual leu o item

    const qb = this.datasource.createQueryBuilder();

    qb.select([
      `id.id AS id`,
      `id.name AS name`,
      `id.description AS description`,
      `id.type AS type`,
      `id.created_at AS created_at`,
      `id.created_by AS created_by_id`,
      `u.name AS created_by`,
      `idv.key AS key`,
      `idv.review_number AS review_number`,
      `idv.version AS version`,
      `idv.storage_type AS storage_type`,
      `idv.storage_key AS storage_key`,
      `idv.created_by AS version_created_by_id`,
      `u2.name AS version_created_by`,
      `CASE WHEN uida.user_id IS NOT NULL THEN 'OK' ELSE 'PENDENTE' END AS status`,
    ])
      .from('intranet_documents', 'id')
      .leftJoin(
        'intranet_documents_versions',
        'idv',
        `id.id = idv.document_id
     AND idv.review_number = (
        SELECT MAX(idv2.review_number)
        FROM "dev".intranet_documents_versions idv2
        WHERE idv2.document_id = id.id
     )`,
      )
      .leftJoin('users', 'u', 'id.created_by = u.id')
      .leftJoin('users', 'u2', 'idv.created_by = u2.id')
      .leftJoin(
        'users_intranet_documents_acceptance',
        'uida',
        'uida.document_version_id = idv.id AND uida.user_id = :userId',
        { userId },
      );

    const data = await qb.getRawMany<FindIntranetDocumentsRawItem>();

    const response = data.map((i) => ({
      id: i.id,
      key: i.key,
      name: i.name,
      description: i.description,
      status: i.status,
      type: i.type,
      reviewNumber: i.review_number,
      version: i.version,
      storageType: i.storage_type,
      storageKey: i.storage_key,
      createdAt: i.created_at,
      createdById: i.created_by_id,
      createdBy: i.created_by,
      versionCreatedById: i.version_created_by_id,
      versionCreatedBy: i.version_created_by,
    }));

    return response;
  }

  private getFileExtension(filename: string) {
    return FileUtils.fileExtension(filename);
  }

  private getS3StorageType() {
    return StorageTypesEnum.S3;
  }

  private getS3Key(filename: string) {
    return `${BUCKET_KEY}/${filename}`;
  }
}
