import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Response } from 'express';
import * as mime from 'mime-types';
import { Readable } from 'stream';

@Injectable()
export class FileService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.API_KEY,
      api_secret: process.env.API_SECRET,
    });
  }

  async handleFileUpload(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File not found');
    }

    const mimeType = mime.lookup(file.originalname);
    if (!mimeType || !mimeType.startsWith('image/')) {
      throw new BadRequestException(
        'Invalid file type. Only images are allowed.',
      );
    }

    const result = await this.uploadToCloudinary(file);
    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  }

  private async uploadToCloudinary(
    file: Express.Multer.File,
  ): Promise<{ secure_url: string; public_id: string }> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'uploads' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result as any);
        },
      );
      Readable.from(file.buffer).pipe(stream);
    });
  }

  async getFilePath(filename: string): Promise<string> {
    // Cloudinary не даёт прямой доступ к пути файла по имени, нужен `publicId`
    // Можно реализовать поиск по `publicId`, если ты его сохраняешь где-то
    throw new NotFoundException(
      'Direct file access not supported. Use URL or store publicId.',
    );
  }

  async sendFile(res: Response, filePath: string) {
    // Cloudinary сам обслуживает файлы по URL
    // Можно редиректить или вернуть ссылку
    res.redirect(filePath); // или просто отправь JSON с URL
  }
}
