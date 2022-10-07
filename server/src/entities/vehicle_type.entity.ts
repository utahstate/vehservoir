import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { SlackUserVehicleTypePreference } from './slack_user_vehicle_type_preference.entity';
import { Vehicle } from './vehicle.entity';

@Entity()
export class VehicleType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, unique: true })
  name: string;

  @Column({ nullable: false, default: '#FF0000', unique: true })
  color: string;

  @OneToMany(() => Vehicle, (vehicle) => vehicle.type)
  vehicles: Vehicle[];

  @OneToMany(
    () => SlackUserVehicleTypePreference,
    (preference) => preference.vehicleType,
  )
  userPreferences: SlackUserVehicleTypePreference[];
}
