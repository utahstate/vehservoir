import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Request } from './request.entity';
import { Vehicle } from './vehicle.entity';

@Entity()
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, type: 'timestamptz' })
  start: Date;

  @Column({ nullable: false, type: 'timestamptz' })
  end: Date;

  @ManyToOne(() => Vehicle, (vehicle: Vehicle) => vehicle.reservations, {
    onDelete: 'CASCADE',
  })
  vehicle: Vehicle;

  @OneToOne(() => Request)
  @JoinColumn()
  request: Request;
}
