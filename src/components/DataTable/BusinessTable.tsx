import {
  Box,
  IconButton,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  styled,
  tableCellClasses,
} from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";
import { Business, ColumnProps } from "../../types";


const TableCellStyled = styled(TableCell)(() => ({
  [`&.${tableCellClasses.head}`]: {
    color: "#000000c7",
    fontSize: 14,
    fontWeight: "bold",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(() => ({
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

export interface BusinessTableProps {
  columns: ColumnProps[];
  data: Business[];
  isLoading: boolean;
  onClickEdit: (businessSelected: Business) => void;
}

export const BusinessTable: React.FC<BusinessTableProps> = ({
  columns,
  data,
  isLoading,
  onClickEdit,
}) => {
  return (
    <TableContainer component={Paper}>
      {isLoading ? (
        <Box sx={{ p: 1 }}>
          <Skeleton variant="rounded" sx={{ width: "100%", height: 60 }} />
          <Skeleton variant="text" sx={{ width: "100%", height: 30 }} />
          <Skeleton variant="text" sx={{ width: "100%", height: 30 }} />
          <Skeleton variant="text" sx={{ width: "100%", height: 30 }} />
        </Box>
      ) : (
        <Table sx={{ minWidth: 500 }} aria-label="customized table">
          <TableHead>
            <TableRow sx={{ backgroundColor: "rgb(0 0 0 / 25%)" }}>
              {columns.map(({ text, align }) => (
                <TableCellStyled key={text} align={align}>
                  {text}
                </TableCellStyled>
              ))}
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <StyledTableRow key={row.id} hover>
                <TableCellStyled align="center">
                  {row.tipoEntidad}
                </TableCellStyled>
                <TableCellStyled align="center">
                  {row.razonSocial || row.nombreCompleto}
                </TableCellStyled>
                <TableCellStyled align="center">{row.cuit}</TableCellStyled>
                <TableCellStyled>{row.pais}</TableCellStyled>
                <TableCellStyled align="center">{row.telefono}</TableCellStyled>
                <TableCellStyled align="center">
                  <Tooltip title="Editar">
                    <IconButton
                      aria-label="Editar"
                      onClick={() => onClickEdit(row)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                </TableCellStyled>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </TableContainer>
  );
};
