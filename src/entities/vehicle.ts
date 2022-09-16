import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Reservation } from "./reservation";
import { VehicleType } from "./vehicle_type";

@Entity()
export class Vehicle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @ManyToOne(() => VehicleType, (type) => type.vehicles, {
    onDelete: "CASCADE",
  })
  type: VehicleType;

  @OneToMany(
    () => Reservation,
    (reservation: Reservation) => reservation.vehicle
  )
  reservations: Reservation[];
}
