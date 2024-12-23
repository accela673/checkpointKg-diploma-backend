import { Module } from '@nestjs/common';
import { HotelsController } from './hotels.controller';
import { HotelsService } from './hotels.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HotelEntity } from './entities/hotel.entity';
import { UserModule } from '../user/user.module';
import { FileModule } from '../file/file.module';

@Module({
  imports: [TypeOrmModule.forFeature([HotelEntity]), UserModule, FileModule],
  controllers: [HotelsController],
  providers: [HotelsService],
})
export class HotelsModule {}
