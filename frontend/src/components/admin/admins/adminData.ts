import { Dispatch, SetStateAction } from 'react';
import { AdminData } from '../../../pages/admin/Admins';
export interface AdminModalProps {
  title: string;
  onSubmitAndStatus: (param: AdminData) => Promise<Response>;
  setCurrentAdminData: (param: AdminData) => void;
  currentAdminData: AdminData;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  isOpen: boolean;
}
