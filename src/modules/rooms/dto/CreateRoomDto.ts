import { IsArray, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  number: string;

  @IsString()
  description: string;

  @IsString()
  roomsNumber: string;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true }) // Чтобы валидировать массив URL-ов
  photos?: string[];
}
