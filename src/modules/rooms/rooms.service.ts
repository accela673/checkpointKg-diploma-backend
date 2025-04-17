import { BadRequestException, Injectable } from '@nestjs/common';
import { BaseService } from 'src/base/base.service';
import { RoomEntity } from './entities/rooms.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from '../user/services/user.service';
import { CreateRoomDto } from './dto/CreateRoomDto';
import { HotelsService } from '../hotels/hotels.service';
import { UserRole } from '../user/enums/roles.enum';
import { UserEntity } from '../user/entities/user.entity';

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
  async getAllMyRooms(userId: number) {
    return this.roomRepository.find({
      relations: ['hotel', 'bookedBy'],
      where: { bookedBy: { id: userId } },
    });
  }

  // Метод для получения одной комнаты по ID
  async getRoomById(id: number) {
    const room = await this.roomRepository.findOne({
      where: { id },
      relations: ['hotel', 'bookedBy', 'hotel.landlord'], // Загружаем связанные данные
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

  async bookRoom(id: number, userId: number) {
    const room = await this.getRoomById(id);
    await this.checkIfExcist(room, 'room', id);

    if (!room.isBooked) {
      const user = await this.userService.findById(userId);
      await this.checkIfExcist(user, 'user', userId);

      room.bookedBy = user;
      room.isBooked = true;
      await this.roomRepository.save(room);

      user.bookedRooms.push(room);
      await this.userService.saveUser(user);
      room.bookedBy = null;
      return room;
    }

    throw new BadRequestException('Комната уже забронирована');
  }

  async releaseRoom(id: number, userId: number) {
    const room = await this.getRoomById(id);
    await this.checkIfExcist(room, 'room', id);

    const user = await this.userService.findById(userId);
    await this.checkIfExcist(user, 'user', userId);

    let updatedRoom: RoomEntity;

    if (user.role === UserRole.CLIENT) {
      updatedRoom = await this.releaseAsClient(room, user);
    } else if (user.role === UserRole.LANDLORD) {
      updatedRoom = await this.releaseAsLandlord(room, user);
    }

    if (updatedRoom?.bookedBy) {
      delete updatedRoom.bookedBy.bookedRooms;
    }

    return updatedRoom;
  }

  private async releaseAsClient(
    room: RoomEntity,
    user: UserEntity,
  ): Promise<RoomEntity> {
    if (room.bookedBy?.id === user.id) {
      room.isBooked = false;
      room.bookedBy = null;

      user.bookedRooms = user.bookedRooms.filter(
        (bookedRoom) => bookedRoom.id !== room.id,
      );

      await this.userService.saveUser(user);
      return await this.roomRepository.save(room);
    }
  }

  private async releaseAsLandlord(room: RoomEntity, user: UserEntity) {
    for (let i = 0; i < user.ownedHotels.length; i++) {
      for (let j = 0; j < user.ownedHotels[i].rooms.length; j++) {
        if (user.id === room.hotel.landlord.id) {
          room.isBooked = false;
          room.bookedBy = null;
          return await this.roomRepository.save(room);
        }
      }
    }
  }
}
