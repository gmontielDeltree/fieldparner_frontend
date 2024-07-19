import { Document } from '../types';

export interface MenuModules extends Document {
    id: number;
    module: string;
    menuOption: string;
    systemType: string;
    details: string;
}