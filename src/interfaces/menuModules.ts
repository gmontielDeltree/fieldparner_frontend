import { Document } from '../types';

//MODULO PADRE QUE CONTIENE LAS OPCIONES DE MENU
export interface Modules extends Document {
  moduleNameEs: string; // NOMBRE DEL MENU EN ESPAÑOL
  moduleNameEn: string; // NOMBRE DEL MENU EN INGLES
  moduleNamePt: string; // NOMBRE DEL MENU EN PORTUGUES
  icon: string;
  orden: number;
}

// OPCIONES DE MENU DENTRO DE CADA MODULO
export interface MenuModules extends Document {
  id: number;
  module: Modules;
  order: string;
  menuOption: string;
  menuOptionEn: string;
  menuOptionPt: string;
  systemType: string;
  menuType: string;
  details: string;
  full: string;
  light: string;
  icon: string;
  route: string;
}

export interface MenuModulesPermission extends MenuModules {
  permission: boolean;
}

export interface ModulesUsers extends Document {
  accountId: string;
  licenceId: string;
  userId: string;
  moduleId: number;
  creationDate: string;
  updateDate: string;
}
