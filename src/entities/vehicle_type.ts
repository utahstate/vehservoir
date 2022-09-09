import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Vehicle } from "./vehicle";

@Entity()
export class VehicleType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, unique: true })
  name: string;

  @OneToMany(() => Vehicle, (vehicle) => vehicle.type)
  vehicles: Vehicle[];
}