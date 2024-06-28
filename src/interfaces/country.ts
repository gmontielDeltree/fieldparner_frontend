import { Document } from '../types';

export interface Country extends Document {
    code: string
    descriptionES: string;
    descriptionPT: string;
    descriptionEN: string;
    language: string;
    currency: string;
    taxKey: string;
    taxKeyFormat: string;
}