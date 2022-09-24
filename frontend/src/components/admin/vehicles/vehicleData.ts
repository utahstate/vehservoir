import React, { Dispatch, SetStateAction } from 'react';
import { CurrentVehicleData } from '../../../pages/admin/Vehicles';
export interface VehicleModalProps {
  title: string;
  onSubmitAndStatus: (param: CurrentVehicleData) => Promise<Response>;
  setCurrentVehicleData: (param: CurrentVehicleData) => void;
  currentVehicleData: CurrentVehicleData;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  isOpen: boolean;
}
