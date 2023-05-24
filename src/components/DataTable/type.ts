import { ColumnProps } from "../../types";

export interface DataTableProps<T> {
    columns: ColumnProps[];
    data: T[];
}