import { BadRequestException, Injectable } from '@nestjs/common';
import { BaseService } from 'src/base/base.service';
import { RoomEntity } from './entities/rooms.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from '../user/services/user.service';
import { CreateRoomDto } from './dto/CreateRoomDto';
import { HotelsService } from '../hotels/hotels.service';

Injectable();
export class RoomsService extends BaseService<RoomEntity> {
  constructor(
    @InjectRepository(RoomEntity)
    private roomRepository: Repository<RoomEntity>,
    private userService: UserService,
    private hotelSErvice: HotelsService,
  ) {
    super(roomRepository);
  }

  // Метод для создания комнаты
  async addRoom(
    userId: number,
    hotelId: number,
    createRoomDto: CreateRoomDto,
    photos: string[],
  ) {
    const user = await this.userService.findById(userId);
    await this.checkIfExcist(user, 'user', userId);
    const hotel = await this.hotelSErvice.getOne(hotelId);
    await this.checkIfExcist(hotel, 'hotel', hotelId);
    if (user.id !== hotel.landlord.id) {
      throw new BadRequestException('You are not the owner');
    }
    const room = new RoomEntity();
    Object.assign(room, createRoomDto);
    room.photos = photos;
    room.roomsNumber = +createRoomDto.roomsNumber;
    hotel.rooms.push(room);
    delete hotel.availableRoomsCount;
    await this.hotelSErvice.saveHotel(hotel);
    await this.roomRepository.save(room);
    return room;
  }

  // Метод для получения всех комнат
  async getAllRooms() {
    return this.roomRepository.find({
      relations: ['hotel', 'bookedBy'], // Загружаем связанные отели и пользователей, которые забронировали комнаты
    });
  }

  // Метод для получения одной комнаты по ID
  async getRoomById(id: number) {
    const room = await this.roomRepository.findOne({
      where: { id },
      relations: ['hotel', 'bookedBy'], // Загружаем связанные данные
    });
    return room;
  }

  // Метод для обновления данных комнаты
  async updateRoom(id: number, updateRoomDto: CreateRoomDto) {
    const room = await this.roomRepository.findOne({ where: { id: id } });
    if (!room) {
      throw new BadRequestException('Room not found');
    }

    // Обновляем данные комнаты
    Object.assign(room, updateRoomDto);
    room.roomsNumber = +updateRoomDto.roomsNumber;
    room.photos = updateRoomDto.photos;

    await this.roomRepository.save(room);
    return room;
  }

  // Метод для удаления комнаты
  async deleteRoom(id: number) {
    const room = await this.roomRepository.findOne({ where: { id: id } });
    if (!room) {
      throw new BadRequestException('Room not found');
    }

    await this.roomRepository.remove(room);
    return { message: 'Room successfully deleted' };
  }
}
