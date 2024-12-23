import { BaseEntity } from 'src/base/base.entity';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from 'src/modules/user/entities/user.entity';

@Entity()
export class HotelEntity extends BaseEntity {
  @Column()
  name: string;

  @Column()
  rooms: number;

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

  @ManyToOne(() => UserEntity, (user) => user.bookedHotels, { nullable: true })
  @JoinColumn({ name: 'bookedById' })
  bookedBy: UserEntity;

  // Связь с арендодателем, который владеет отелем
  @ManyToOne(() => UserEntity, (user) => user.ownedHotels)
  @JoinColumn({ name: 'landlordId' })
  landlord: UserEntity;

  @Column('simple-array', { nullable: true })
  photos: string[];

  @Column({ default: false })
  isBooked: boolean;
}
