import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  UploadedFiles,
  UseInterceptors,
  Req,
  Res,
} from '@nestjs/common';
import { HotelsService } from './hotels.service';
import { Roles } from '../user/guards/role.decorator';
import { RolesGuard } from '../user/guards/role.guard';
import { UserRole } from '../user/enums/roles.enum';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { HotelEntity } from './entities/hotel.entity';
import { FileFieldsInterceptor } from '@nestjs/platform-express'; // Для работы с несколькими файлами
import { CreateHotelDto } from './dto/CreateHotel.dto';
import { FileService } from '../file/file.service';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { Response } from 'express';

@Controller('hotels')
@ApiTags('Hotels') // Эта аннотация группирует все эндпоинты по тегу "Hotels"
export class HotelsController {
  constructor(
    private readonly hotelsService: HotelsService,
    private readonly fileService: FileService,
  ) {}

  // Добавление отеля арендодателем
  @Post()
  @ApiBearerAuth()
  @Roles(UserRole.LANDLORD)
  @UseGuards(JwtAuthGuard, RolesGuard) // Защищаем эндпоинт с помощью JWT и роли
  @ApiConsumes('multipart/form-data') // Указываем, что запрос будет содержать файлы
  @ApiOperation({ summary: 'Add a new hotel' })
  @UseInterceptors(FileFieldsInterceptor([{ name: 'photos', maxCount: 10 }])) // Максимум 10 фото
  async addHotel(
    @Body() hotelData: CreateHotelDto, // Параметры тела запроса
    @UploadedFiles() files: { photos?: Express.Multer.File[] }, // Файлы, загруженные в поле photos
    @Req() req,
  ) {
    const photosUrls = [];
    if (files?.photos) {
      for (const file of files.photos) {
        // Загружаем файл и получаем URL
        const uploadedFile = await this.fileService.handleFileUpload(file);
        photosUrls.push(uploadedFile.url);
      }
    }

    // Добавляем фотографии в данные отеля
    hotelData.photos = photosUrls;

    return this.hotelsService.addHotel(+req.user.id, hotelData, photosUrls);
  }

  // Получение списка отелей арендодателя
  @Get('landlord')
  @ApiBearerAuth() // Требуется авторизация
  @Roles(UserRole.LANDLORD)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get all hotels owned by a landlord' }) // Параметры запроса
  @ApiResponse({
    status: 200,
    description: 'List of owned hotels',
    type: [HotelEntity],
  })
  @ApiResponse({ status: 404, description: 'Landlord not found' })
  async getLandlordHotels(@Req() req) {
    return this.hotelsService.getLandlordHotels(req.user.id);
  }

  @ApiOperation({ summary: 'Get all hotels for user' }) // Параметры запроса
  @Get('/all')
  async getAllHotels() {
    return await this.hotelsService.getAll();
  }

  @ApiOperation({ summary: 'Get one hotel' }) // Параметры запроса
  @Get('/one/:id')
  async getOneHotel(@Param('id') id: string) {
    return await this.hotelsService.getOne(+id);
  }

  @Get('files/:filename')
  @ApiOperation({ summary: 'Получение файла' })
  @ApiParam({ name: 'filename', description: 'Имя файла' })
  async getFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = await this.fileService.getFilePath(filename);
    await this.fileService.sendFile(res, filePath);
  }
}
