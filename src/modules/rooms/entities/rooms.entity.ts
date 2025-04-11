import { BaseEntity } from 'src/base/base.entity';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { HotelEntity } from 'src/modules/hotels/entities/hotel.entity';

@Entity()
export class RoomEntity extends BaseEntity {
  @Column()
  number: string;

  @Column()
  description: string;

  @Column()
  roomsNumber: number;

  @Column('simple-array', { nullable: true })
  photos: string[];

  @Column({ default: false })
  isBooked: boolean;

  @ManyToOne(() => UserEntity, (user) => user.bookedRooms, {
    nullable: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  bookedBy: UserEntity;

  @ManyToOne(() => HotelEntity, (hotel) => hotel.rooms, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'hotelId' })
  hotel: HotelEntity;
}
