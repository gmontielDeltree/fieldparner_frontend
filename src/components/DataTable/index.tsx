import {
  Box,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  styled,
  tableCellClasses,
} from "@mui/material";
import { ColumnProps } from "@types";
import React, { ReactNode } from "react";

export const TableCellStyled = styled(TableCell)(() => ({
  [`&.${tableCellClasses.head}`]: {
    color: "#000000c7",
    fontSize: 14,
    fontWeight: "bold",
    padding: "16px 10px",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 12,
  },
}));

export const TableCellStyledBlack = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
    padding: "16px 10px",
    fontSize: 14
  },
  [`&.${tableCellClasses.body}`]: {
    // padding: '5px',
    fontSize: 12,
  },
}));

export const ItemRow = styled(TableRow)(() => ({
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

export interface DataTableProps {
  isLoading: boolean;
  columns: ColumnProps[];
  children?: ReactNode | ReactNode[];
}

export const DataTable: React.FC<DataTableProps> = ({
  isLoading,
  columns,
  children,
}) => {
  return (
    <TableContainer
      component={Paper}
      sx={{ maxHeight: 440 }}>
      {isLoading ? (
        <Box sx={{ p: 1 }}>
          <Skeleton variant="rounded" sx={{ width: "100%", height: 60 }} />
          <Skeleton variant="text" sx={{ width: "100%", height: 30 }} />
          <Skeleton variant="text" sx={{ width: "100%", height: 30 }} />
          <Skeleton variant="text" sx={{ width: "100%", height: 30 }} />
        </Box>
      ) : (
        <Table stickyHeader sx={{ minWidth: 300 }} aria-label="customized table" >
          <TableHead sx={{ height: "70px", }}>
            <TableRow >
              {columns.map(({ text, align }) => (
                <TableCellStyledBlack
                  sx={{ backgroundColor: "rgb(0 0 0 / 25%)" }}
                  key={text}
                  align={align}>
                  {text}
                </TableCellStyledBlack>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>{children}</TableBody>
        </Table>
      )}
    </TableContainer>
  );
};