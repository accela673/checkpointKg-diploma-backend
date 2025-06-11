import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Put,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Req,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/CreateRoomDto';
import { RoomEntity } from './entities/rooms.entity';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '../user/enums/roles.enum';
import { Roles } from '../user/guards/role.decorator';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { RolesGuard } from '../user/guards/role.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { FileService } from '../file/file.service';

@ApiTags('Rooms')
@Controller('rooms')
export class RoomsController {
  constructor(
    private readonly roomsService: RoomsService,
    private readonly fileService: FileService,
  ) {}

  // Создание комнаты
  @Post(':id')
  @ApiBearerAuth()
  @Roles(UserRole.LANDLORD)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Add a room for hotel' })
  @UseInterceptors(FileFieldsInterceptor([{ name: 'photos', maxCount: 10 }]))
  async addHotel(
    @Param('id') hotelId: number,
    @Body() roomData: CreateRoomDto,
    @UploadedFiles() files: { photos?: Express.Multer.File[] },
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
    roomData.photos = photosUrls;

    return this.roomsService.addRoom(
      +req.user.id,
      hotelId,
      roomData,
      photosUrls,
    );
  }

  @ApiOperation({ summary: 'Get all rooms' }) // Параметры запроса
  @Get()
  async getAllRooms(): Promise<RoomEntity[]> {
    return this.roomsService.getAllRooms();
  }

  @ApiOperation({ summary: 'Get all my rooms' }) // Параметры запроса
  @Get('all/my')
  @ApiBearerAuth()
  @Roles(UserRole.CLIENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAllMyRooms(@Req() req) {
    return this.roomsService.getAllMyRooms(+req.user.id);
  }

  @ApiOperation({ summary: 'Get one room' }) // Параметры запроса
  @Get(':id')
  async getRoomById(@Param('id') id: number): Promise<RoomEntity> {
    return this.roomsService.getRoomById(id);
  }

  @ApiOperation({ summary: 'Update room' }) // Параметры запроса
  @Put(':id')
  async updateRoom(
    @Param('id') id: number,
    @Body() updateRoomDto: CreateRoomDto,
  ): Promise<RoomEntity> {
    return this.roomsService.updateRoom(id, updateRoomDto);
  }

  @ApiOperation({ summary: 'Delete room' }) // Параметры запроса
  @Delete(':id')
  async deleteRoom(@Param('id') id: number): Promise<{ message: string }> {
    return this.roomsService.deleteRoom(id);
  }

  @ApiOperation({ summary: 'Book room' }) // Параметры запроса
  @Put('book/one/:id')
  @ApiBearerAuth()
  @Roles(UserRole.CLIENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async bookHotel(@Param('id') id: string, @Req() req) {
    return await this.roomsService.bookRoom(+id, req.user.id);
  }

  @ApiOperation({ summary: 'Release room' }) // Параметры запроса
  @Put('release/one/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async release(@Param('id') id: string, @Req() req) {
    return await this.roomsService.releaseRoom(+id, req.user.id);
  }
}
