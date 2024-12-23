import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as mime from 'mime-types';
import { v4 as uuidv4 } from 'uuid';
import { extname, join } from 'path';
import { Response } from 'express';

@Injectable()
export class FileService {
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

    const uploadFolder = './uploads';
    if (!fs.existsSync(uploadFolder)) {
      fs.mkdirSync(uploadFolder);
    }

    const filename: string = uuidv4() + extname(file.originalname); // Генерация уникального имени для файла
    const filePath = join(uploadFolder, filename);

    await this.writeToDisk(file.buffer, filePath);
    return {
      url: `${process.env.BASE_URL}/hotels/files/${filename}`,
      path: filePath,
    }; // Возвращаем URL для доступа
  }

  private async writeToDisk(buffer: Buffer, filePath: string): Promise<void> {
    const writeStream = fs.createWriteStream(filePath);
    writeStream.write(buffer);
    writeStream.end();
  }

  async getFilePath(filename: string): Promise<string> {
    const filePath = join(process.cwd(), 'uploads', filename);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`File ${filename} not found`);
    }

    return filePath;
  }

  async sendFile(res: Response, filePath: string) {
    res.sendFile(filePath);
  }
}
