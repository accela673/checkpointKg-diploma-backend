import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class CodeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  confirmCode: string;

  @Column()
  createdAt: Date;
}
