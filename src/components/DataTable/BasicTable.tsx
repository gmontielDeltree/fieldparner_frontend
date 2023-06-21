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
        fontSize: 14,
        padding: '5px',
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));


export interface BasicTableProps {
    columns: string[];
    rows: RowData[];
    handleAddRow: (value: RowData) => void;
    deleteRow: (row: RowData) => void;
}

const BasicTable: React.FC<BasicTableProps> = ({
    columns,
    rows,
    deleteRow,
    handleAddRow }) => {

    const { name,
        description,
        formulario,
        reset,
        handleInputChange } = useForm<RowData>({ name: '', description: '' });

    const handleAddEspecificacion = () => {
        handleAddRow(formulario);
        reset();
    }

    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 400 }} aria-label="customized table">
                <TableHead>
                    <TableRow>
                        {
                            columns.map((column) => (
                                <StyledTableCell key={column}>{column}</StyledTableCell>
                            ))
                        }
                        <StyledTableCell key="actions">
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
                        <StyledTableCell sx={{ minWidth: 200, maxWidth: 250 }}>
                            <TextField
                                variant="outlined"
                                type='text'
                                name="name"
                                value={name}
                                onChange={handleInputChange}
                                fullWidth />
                        </StyledTableCell>
                        <StyledTableCell sx={{ p: '5px' }}>
                            <TextField
                                variant="outlined"
                                type='text'
                                name="description"
                                value={description}
                                onChange={handleInputChange}
                                fullWidth />
                        </StyledTableCell>
                        <StyledTableCell align='right'>
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
                            <TableCell key={row.name} component="th" scope="row" sx={{ p: '5px' }}>
                                {row.name}
                            </TableCell>
                            <TableCell key={row.description} component="th" scope="row" sx={{ p: '5px' }}>
                                {row.description}
                            </TableCell>
                            <TableCell align='right'>
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

export default BasicTable;