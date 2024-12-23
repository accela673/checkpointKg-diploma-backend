import { BaseEntity } from 'src/base/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { UserRole } from '../enums/roles.enum';
import { LangRole } from '../enums/lang.enum';
import { HotelEntity } from 'src/modules/hotels/entities/hotel.entity';

@Entity()
export class UserEntity extends BaseEntity {
  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  confirmCodeId: number;

  @Column({ nullable: true })
  passwordRecoveryCodeId: number;

  @Column({ default: false })
  isConfirmed: boolean;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CLIENT,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: LangRole,
    default: LangRole.RU,
  })
  language: LangRole;

  @OneToMany(() => HotelEntity, (hotel) => hotel.bookedBy, { nullable: true })
  bookedHotels: HotelEntity[];

  // Поле для отелей, принадлежащих арендодателю
  @OneToMany(() => HotelEntity, (hotel) => hotel.landlord)
  ownedHotels: HotelEntity[];
}
