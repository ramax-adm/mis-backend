import { GetObjectRequest, PutObjectCommandOutput } from '@aws-sdk/client-s3';

export interface PutObject {
  Bucket: string;
  Key: string;
  Body: Buffer;
}

// TODO: categorize all object types
export type S3ObjectType = 'default' | 'excel';

export type S3FileType = string | Uint8Array | undefined;

export interface IStorageService {
  getObject(
    params: GetObjectRequest,
    objectType?: S3ObjectType,
  ): Promise<S3FileType>;

  upload(params: PutObject): Promise<PutObjectCommandOutput>;

  getSignedUrl(
    params: GetObjectRequest,
    expiresInSeconds: number,
  ): Promise<string>;

  uploadSignedUrl(params: PutObject, expiresInSeconds: number): Promise<string>;

  deleteFile(bucketName: string, s3Key: string): Promise<boolean>;

  fileExists(bucketName: string, s3Key: string): Promise<boolean>;
}
