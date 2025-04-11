import { BaseEntity } from 'src/base/base.entity';
import { Column, Entity, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { RoomEntity } from 'src/modules/rooms/entities/rooms.entity';

@Entity()
export class HotelEntity extends BaseEntity {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  address: string;

  @Column({ nullable: true })
  twoGisURL: string;

  @Column({ nullable: true })
  googleMapsURL: string;

  @Column()
  phoneNumber: string;

  @Column({ nullable: true })
  telegram: string;

  @Column('simple-array', { nullable: true })
  photos: string[];

  @Column({ default: false })
  isBooked: boolean;

  @OneToMany(() => RoomEntity, (room) => room.hotel, {
    nullable: true,
    cascade: true,
  })
  rooms: RoomEntity[];

  @ManyToOne(() => UserEntity, (user) => user.ownedHotels, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'landlordId' })
  landlord: UserEntity;
}
