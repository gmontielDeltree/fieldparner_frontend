import { Document } from '../types';

export interface MenuModules extends Document {
  id: number | string;
  module: string;
  order?: string; // puede venir o no
  menuOption: string;
  menuOptionEn?: string;
  menuOptionPt?: string;
  systemType?: string;
  details?: string;
  menuType: string;
  full?: string;
  light?: string;
  icon?: string | null;
}

export interface MenuModulesPermission extends MenuModules {
  permission: boolean;
}

export interface ModulesUsers extends Document {
  accountId: string;
  licenceId: string;
  userId: string;
  menuId: number;
  permission: boolean;
  creationDate: string;
}
