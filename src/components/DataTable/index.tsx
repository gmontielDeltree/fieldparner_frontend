import {
    Chip,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    styled,
    tableCellClasses
} from '@mui/material';
import {
    ContentCopy as ContentCopyIcon,
    Delete as DeleteIcon,
    Edit as EditIcon
} from '@mui/icons-material';
import { DataTableProps } from './type';
import { Equipo } from '../../types';


const TableCellStyled = styled(TableCell)(() => ({
    [`&.${tableCellClasses.head}`]: {
        color: '#000000c7',
        fontSize: 14,
        fontWeight: 'bold'
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    }
}));

const StyledTableRow = styled(TableRow)(() => ({
    // '&:nth-of-type(odd)': {
    //     backgroundColor: theme.palette.action.hover,
    // },
    // hide last border
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));


export const DataTable: React.FC<DataTableProps> = ({ columns, data }) => {
    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 500 }} aria-label="customized table">
                <TableHead>
                    <TableRow sx={{ backgroundColor: 'rgb(0 0 0 / 25%)' }}>
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
                        <StyledTableRow key={row.nro} hover >
                            <TableCellStyled component="th" scope="row">
                                {row.patente}
                            </TableCellStyled>
                            <TableCellStyled align="center">{row.tipoVehiculo}</TableCellStyled>
                            <TableCellStyled align="center">{row.marca} </TableCellStyled>
                            <TableCellStyled align="center">{row.modelo}</TableCellStyled>
                            <TableCellStyled align="center">{row.año}</TableCellStyled>
                            <TableCellStyled align="center">
                                <Tooltip title="Editar">
                                    <IconButton>
                                        <EditIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Copiar">
                                    <IconButton>
                                        <ContentCopyIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Eliminar">
                                    <IconButton>
                                        <DeleteIcon />
                                    </IconButton>
                                </Tooltip>
                            </TableCellStyled>
                        </StyledTableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

export default DataTable;