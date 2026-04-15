import { Document } from '../types';

export interface System extends Document {
  id: string;
  system: string;
  version: string;
  technicalDetails: string;
  description: string;
}
