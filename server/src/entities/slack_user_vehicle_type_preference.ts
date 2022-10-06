import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { VehicleType } from './vehicle_type';

@Entity()
export class SlackUserVehicleTypePreference {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, unique: true })
  slackUserId: string;

  @ManyToOne(() => VehicleType, (type) => type.userPreferences)
  vehicleType: VehicleType;
}
