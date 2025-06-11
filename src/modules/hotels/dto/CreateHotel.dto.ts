import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsUrl,
} from 'class-validator';

export class CreateHotelDto {
  @IsString()
  name: string;

  @IsString()
  region: string;

  @IsString()
  description: string;

  @IsString()
  address: string;

  @IsString()
  phoneNumber: string;

  @IsOptional()
  @IsString()
  // @IsUrl()
  twoGisURL?: string;

  @IsOptional()
  @IsString()
  // @IsUrl()
  googleMapsURL?: string;

  @IsOptional()
  @IsString()
  telegram?: string;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true }) // Чтобы валидировать массив URL-ов
  photos?: string[];
}
