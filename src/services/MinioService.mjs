import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
// eslint-disable-next-line
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import Boom from '@hapi/boom';
import { MINIO_ACCESS_KEY, MINIO_HOST, MINIO_SECRET_KEY } from '../commons/env.mjs';
import { BUCKET_NAME } from '../commons/constans.mjs';
import getStreamBuffer from '../handlers/filters/getStreamBuffer.mjs';

class MinioService {
  conn = null;

  constructor() {
    if (!this.conn) {
      this.conn = new S3Client({
        region: 'us-east-1',
        credentials: {
          accessKeyId: MINIO_ACCESS_KEY,
          secretAccessKey: MINIO_SECRET_KEY,
        },
        endpoint: MINIO_HOST,
        forcePathStyle: true,
      });
    }
  }

  async getImageBuffer(image) {
    const { originalname } = image;

    const response = await this.conn.send(new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: originalname,
    }));

    return getStreamBuffer(response.Body);
  }

  async saveImage(image) {
    try {
      if (!image) {
        throw Boom.badRequest('Image is required');
      }

      if (!image.originalname) {
        throw Boom.badRequest('Image originalname is required');
      }

      if (!image.buffer) {
        throw Boom.badRequest('Image buffer is required');
      }

      const { originalname, buffer } = image;

      const originalNameParts = originalname.split('.');

      if (originalNameParts.length !== 2) {
        throw Boom.badRequest('Invalid image name');
      }

      const extension = originalNameParts[1];

      if (extension !== 'png' && extension !== 'jpg' && extension !== 'jpeg' && extension !== 'PNG' && extension !== 'JPG' && extension !== 'JPEG') {
        throw Boom.badRequest('Invalid image extension');
      }

      // const fileName = `${v4()}.${extension}`;

      await this.conn.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: originalname,
        Body: buffer,
      }));

      return originalname;
    } catch (error) {
      throw Boom.isBoom(error) ? error
        : Boom.internal('Error saving image', error);
    }
  }

  async generateSignedUrl(imgName) {
    try {
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: imgName,
      });
      const url = await getSignedUrl(this.conn, command, { expiresIn: 86400 });
      return url;
    } catch (error) {
      throw Boom.isBoom(error) ? error : Boom.internal('Error, it was not possible to create the signed url', error);
    }
  }
}

export default MinioService;
