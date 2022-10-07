import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Reservation } from './reservation.entity';
import { VehicleType } from './vehicle_type.entity';

@Entity()
export class Vehicle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @ManyToOne(() => VehicleType, (type) => type.vehicles, {
    onDelete: 'CASCADE',
  })
  type: VehicleType;

  @OneToMany(
    () => Reservation,
    (reservation: Reservation) => reservation.vehicle,
  )
  reservations: Reservation[];
}
