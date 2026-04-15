import { Document } from '../types';

export interface CostsExpenses extends Document {
    costCode: string;
    costCenter: string;
    description: string;
} 
export interface CostsExpensesState {
    costsExpensesActive: CostsExpenses| null;
    CostsExpenses: CostsExpenses[];
  }
