import { Document } from '../types';

export interface MenuModules extends Document {
    id: number;
    module: string;
    order: string;
    menuOption: string;
    systemType: string;
    details: string;
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