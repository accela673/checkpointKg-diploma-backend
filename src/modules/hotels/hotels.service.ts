import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HotelEntity } from './entities/hotel.entity';
import { BaseService } from 'src/base/base.service';
import { UserService } from '../user/services/user.service';
import { CreateHotelDto } from './dto/CreateHotel.dto';

@Injectable()
export class HotelsService extends BaseService<HotelEntity> {
  constructor(
    @InjectRepository(HotelEntity)
    private hotelRepository: Repository<HotelEntity>,
    private userService: UserService,
  ) {
    super(hotelRepository);
  }

  async saveHotel(hotel) {
    if (hotel) {
      return await this.hotelRepository.save(hotel);
    }
  }

  // Метод для добавления гостиницы
  async addHotel(
    landlordId: number, // ID арендодателя из токена
    hotelData: CreateHotelDto, // Данные для создания отеля
    photos: string[], // URL-адреса фотографий
  ) {
    // Проверка на существование арендодателя (если нужно)
    const landlord = await this.userService.findLandlord(landlordId);
    if (!landlord) {
      throw new BadRequestException('Landlord not found');
    }

    // Создание нового отеля
    const hotel = new HotelEntity();
    hotel.name = hotelData.name;
    hotel.description = hotelData.description;
    hotel.address = hotelData.address;
    hotel.twoGisURL = hotelData.twoGisURL;
    hotel.googleMapsURL = hotelData.googleMapsURL;
    hotel.phoneNumber = hotelData.phoneNumber;
    hotel.telegram = hotelData.telegram;
    hotel.photos = photos; // Привязываем фотографии

    // Связываем отель с арендодателем
    hotel.landlord = landlord;

    // Сохраняем отель в базе данных
    return this.hotelRepository.save(hotel);
  }

  // Метод для получения всех отелей арендодателя
  async getLandlordHotels(landlordId: number): Promise<HotelEntity[]> {
    return this.hotelRepository.find({
      where: { landlord: { id: landlordId } },
    });
  }

  async getAll() {
    const hotels = await this.hotelRepository.find({
      relations: ['rooms', 'rooms.bookedBy'],
    });

    const availableHotels = hotels
      .map((hotel) => {
        const availableRooms = hotel.rooms.filter((room) => !room.bookedBy);
        if (availableRooms.length > 0) {
          return {
            ...hotel,
            availableRoomsCount: availableRooms.length,
            rooms: hotel.rooms, // если хочешь можно заменить на availableRooms
          };
        }
        return null;
      })
      .filter((hotel) => hotel !== null);

    return availableHotels;
  }

  async getOne(id: number) {
    const hotel = await this.hotelRepository.findOne({
      where: { id },
      relations: ['rooms', 'rooms.bookedBy', 'landlord'],
    });

    if (!hotel) {
      throw new BadRequestException('Hotel not found');
    }

    const availableRooms = hotel.rooms.filter((room) => !room.bookedBy);

    const res = {
      ...hotel,
      availableRoomsCount: availableRooms.length,
    };

    return res;
  }

  async getAvailableHotels() {
    return await this.hotelRepository.find({ where: { isBooked: false } });
  }
}
