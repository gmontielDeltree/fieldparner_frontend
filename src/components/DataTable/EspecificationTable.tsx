import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Fab, IconButton, TextField, Tooltip } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { RowData } from '../../types';
import { useForm } from '../../hooks';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        padding: '5px',
        fontSize: 14,
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    // '&:nth-of-type(odd)': {
    //     backgroundColor: theme.palette.action.hover,
    // },
    // hide last border
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));


export interface EspecificationTableProps {
    columns: string[];
    rows: RowData[];
    handleAddRow: (value: RowData) => void;
    deleteRow: (row: RowData) => void;
}

const EspecificationTable: React.FC<EspecificationTableProps> = ({
    columns,
    rows,
    deleteRow,
    handleAddRow }) => {

    const { name,
        description,
        formulario,
        reset,
        handleInputChange } = useForm<RowData>({ name: '', description: '' });

    const handleAddEspecificacion = (): void => {
        if (!name) return;
        handleAddRow(formulario);
        reset();
    }

    return (
        <TableContainer
            key="table-especificaciones"
            component={Paper}>
            <Table sx={{ minWidth: 400 }} aria-label="customized table">
                <TableHead>
                    <TableRow>
                        {
                            columns.map((column) => (
                                <StyledTableCell key={column}>{column}</StyledTableCell>
                            ))
                        }
                        <StyledTableCell key="actions" align='center'>
                            <Fab
                                color="success"
                                aria-label="add"
                                size='small'
                                onClick={handleAddEspecificacion}
                            >
                                <AddIcon />
                            </Fab>
                        </StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <StyledTableRow key="new-especificacion">
                        <StyledTableCell sx={{ minWidth: 150, maxWidth: 200 }}>
                            <TextField
                                variant="outlined"
                                size='small'
                                type='text'
                                name="name"
                                value={name}
                                onChange={handleInputChange}
                                fullWidth />
                        </StyledTableCell>
                        <StyledTableCell sx={{ minWidth: 350, maxWidth: 400 }}>
                            <TextField
                                variant="outlined"
                                size='small'
                                type='text'
                                name="description"
                                value={description}
                                onChange={handleInputChange}
                                fullWidth />
                        </StyledTableCell>
                        <StyledTableCell align='center' sx={{ minWidth: 100, maxWidth: 110 }}>
                            <Tooltip title="Reset">
                                <IconButton
                                    onClick={() => reset()}
                                    color='default'>
                                    <RefreshIcon />
                                </IconButton>
                            </Tooltip>
                        </StyledTableCell>
                    </StyledTableRow>
                    {rows.map((row) => (
                        <StyledTableRow key={row.name}>
                            <TableCell align='center' sx={{ p: '5px', minWidth: 200, maxWidth: 250 }}>
                                {row.name}
                            </TableCell>
                            <TableCell sx={{ p: '5px', minWidth: 350, maxWidth: 450 }}>
                                {row.description}
                            </TableCell>
                            <TableCell align='center' sx={{ p: '5px' }}>
                                <Tooltip title="Eliminar">
                                    <IconButton
                                        onClick={() => deleteRow(row)}
                                        color='error'>
                                        <DeleteIcon />
                                    </IconButton>
                                </Tooltip>
                            </TableCell>
                        </StyledTableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default EspecificationTable;