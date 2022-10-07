import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { VehicleType } from './vehicle_type.entity';

@Entity()
export class SlackUserVehicleTypePreference {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, unique: true })
  slackUserId: string;

  @ManyToOne(() => VehicleType, (type) => type.userPreferences)
  vehicleType: VehicleType;
}
