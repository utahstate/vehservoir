import { Dispatch, SetStateAction } from 'react';
import { VehicleData } from '../../../pages/admin/Vehicles';
export interface VehicleModalProps {
  title: string;
  onSubmitAndStatus: (param: VehicleData) => Promise<Response>;
  setCurrentVehicleData: (param: VehicleData) => void;
  currentVehicleData: VehicleData;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  isOpen: boolean;
}
