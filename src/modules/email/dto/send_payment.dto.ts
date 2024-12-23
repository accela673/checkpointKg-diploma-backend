import { IsNotEmpty, IsOptional } from 'class-validator';

export class SendPaymentDto {
  @IsNotEmpty()
  articleId: number;

  @IsOptional()
  checkFile: Express.Multer.File;
}
