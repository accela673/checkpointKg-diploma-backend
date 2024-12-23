import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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
    hotel.rooms = +hotelData.rooms;
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
      where: { id: landlordId },
    });
  }

  // Метод для бронирования отеля
  async bookHotel(hotelId: number, clientId: number): Promise<HotelEntity> {
    const hotel = await this.hotelRepository.findOne({
      where: { id: hotelId },
    });
    if (!hotel) {
      throw new BadRequestException('Hotel not found');
    }

    if (hotel.isBooked) {
      throw new BadRequestException('Hotel is already booked');
    }

    hotel.isBooked = true;
    hotel.bookedBy = await this.userService.findById(clientId); // Добавляем ID клиента, который забронировал
    await this.hotelRepository.save(hotel);

    return hotel;
  }

  async getAvailableHotels() {
    return await this.hotelRepository.find({ where: { isBooked: false } });
  }
}
