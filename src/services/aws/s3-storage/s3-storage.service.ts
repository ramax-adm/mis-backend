import {
  S3Client,
  S3ClientConfig,
  GetObjectCommand,
  GetObjectRequest,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  HeadObjectCommand,
  PutObjectCommandInput,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, Inject, Logger } from '@nestjs/common';
import { IStorageService, S3ObjectType, S3FileType, PutObject } from './common';
import { EnvService } from '@/config/env/env.service';

@Injectable()
export class S3StorageService implements IStorageService {
  private readonly s3Client: S3Client;

  constructor(
    @Inject('AWS_CONFIG_CONNECTION_OPTIONS')
    private s3Config: S3ClientConfig,
    private envService: EnvService,
  ) {
    Logger.log('Initializing Aws Module', 'AWS S3 STORAGE SERVICE');
    this.s3Client = new S3Client(s3Config);
  }

  // File Manipulation
  async fileExists(bucketName: string, s3Key: string): Promise<boolean> {
    const params = {
      Bucket: bucketName,
      Key: s3Key,
    };

    try {
      await this.s3Client.send(new HeadObjectCommand(params));
      return true;
    } catch (error) {
      if (error.name === 'NotFound') {
        return false;
      }
      console.error(`Error checking if file exists: ${s3Key}`, error);
      throw new Error(`Could not check if file exists: ${error.message}`);
    }
  }

  async getObject(params: GetObjectRequest, objectType?: S3ObjectType) {
    const command = new GetObjectCommand(params);
    const response = await this.s3Client.send(command);

    let fileContent: S3FileType;

    switch (objectType) {
      case 'excel': {
        fileContent = await response.Body?.transformToByteArray();
        console.log(`File size: ${fileContent.length} bytes`);
        return fileContent;
      }
      default: {
        // The Body object also has 'transformToByteArray' and 'transformToWebStream' methods.
        fileContent = await response.Body?.transformToString();
        return fileContent;
      }
    }
  }

  async upload(params: PutObject | PutObjectCommandInput) {
    return await this.s3Client.send(new PutObjectCommand(params));
  }

  async deleteFile(bucketName: string, s3Key: string): Promise<boolean> {
    const params = {
      Bucket: bucketName,
      Key: s3Key,
    };

    try {
      await this.s3Client.send(new DeleteObjectCommand(params));
      return true;
    } catch (error) {
      console.error(`Failed to delete file: ${s3Key}`, error);
      return false;
    }
  }

  async deleteFiles(bucketName: string, s3Keys: string[]): Promise<boolean> {
    const objects = s3Keys.map((key) => ({ Key: key }));

    const params = {
      Bucket: bucketName,
      Delete: {
        Objects: objects,
        Quiet: false,
      },
    };

    try {
      await this.s3Client.send(new DeleteObjectsCommand(params));
      return true;
    } catch (error) {
      console.error(`Failed to delete files: ${s3Keys.join(', ')}`, error);
      return false;
    }
  }

  // Signed Url
  async getSignedUrl(params: GetObjectRequest, expiresInSeconds = 3600) {
    const command = new GetObjectCommand(params);
    return await getSignedUrl(this.s3Client, command, {
      expiresIn: expiresInSeconds,
    });
  }

  async uploadSignedUrl(params: PutObject, expiresInSeconds: number) {
    const command = new PutObjectCommand(params);
    return await getSignedUrl(this.s3Client, command, {
      expiresIn: expiresInSeconds,
    });
  }
}
