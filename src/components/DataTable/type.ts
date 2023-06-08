import { ColumnProps, Vehiculo } from "../../types";

export interface DataTableProps {
    columns: ColumnProps[];
    data: Vehiculo[];
    isLoading: boolean;
}