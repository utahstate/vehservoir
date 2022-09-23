import React, { Dispatch, SetStateAction } from 'react';
import { CurrentVehicleData } from '../../../pages/admin/Vehicles';
export interface VehicleModalProps {
  title: string;
  onSubmit: (param: CurrentVehicleData) => void;
  setCurrentVehicleData: (param: any) => void;
  currentVehicleData: CurrentVehicleData;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  isOpen: boolean;
}
