// import * as React from 'react';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Fab, Grid, IconButton, InputAdornment, TextField, Tooltip } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { Mantenimiento, RowData } from '@types';
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


export interface MaintenanceTableProps {
    columns: string[];
    rows: Mantenimiento[];
    handleAddRow: (value: Mantenimiento) => void;
    deleteRow: (id: string) => void;
}

const initialState: Mantenimiento = {
    id: new Date().getTime().toString(),
    fecha: '',
    kilometros: 0,
    descripcion: '',
    observacion: '',
    proximo: ''
};

const MaintenanceTable: React.FC<MaintenanceTableProps> = ({
    columns,
    rows,
    handleAddRow,
    deleteRow }) => {

    const { fecha,
        kilometros,
        descripcion,
        observacion,
        proximo,
        formulario,
        reset,
        handleInputChange } = useForm<Mantenimiento>(initialState);

    const handleAddMantenimiento = (): void => {
        if (!fecha && (kilometros !== 0) && !descripcion && !proximo) return;
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
                                onClick={handleAddMantenimiento}
                            >
                                <AddIcon />
                            </Fab>
                        </StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <StyledTableRow key="new-maintenace">
                        <StyledTableCell sx={{ minWidth: 150, maxWidth: 180 }}>
                            <TextField
                                variant="outlined"
                                size='small'
                                type='date'
                                name="fecha"
                                value={fecha}
                                onChange={handleInputChange}
                                fullWidth />
                        </StyledTableCell>
                        <StyledTableCell sx={{ minWidth: 100, maxWidth: 110 }}>
                            <TextField
                                variant="outlined"
                                size='small'
                                type='number'
                                name="kilometros"
                                value={kilometros}
                                onChange={handleInputChange}
                            />
                        </StyledTableCell>
                        <StyledTableCell sx={{ minWidth: 300, maxWidth: 350 }}>
                            <TextField
                                variant="outlined"
                                type='text'
                                size='small'
                                name="descripcion"
                                value={descripcion}
                                onChange={handleInputChange}
                                fullWidth />
                        </StyledTableCell>
                        <StyledTableCell sx={{ minWidth: 250, maxWidth: 300 }}>
                            <TextField
                                variant="outlined"
                                type='text'
                                size='small'
                                name="observacion"
                                value={observacion}
                                onChange={handleInputChange}
                                fullWidth />
                        </StyledTableCell>
                        <StyledTableCell sx={{ minWidth: 150, maxWidth: 180 }}>
                            <TextField
                                variant="outlined"
                                size='small'
                                type='date'
                                name="proximo"
                                value={proximo}
                                onChange={handleInputChange}
                                fullWidth />
                        </StyledTableCell>
                        <StyledTableCell align='center'>
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
                        <StyledTableRow key={row.id}>
                            <TableCell
                                align='center'
                                sx={{
                                    p: '5px',
                                    minWidth: 150,
                                    maxWidth: 180
                                }}>
                                {/* <TextField
                                    variant="outlined"
                                    size='small'
                                    type='date'
                                    name="fecha"
                                    value={row.fecha}
                                    // onChange={handleInputChange}
                                    // InputProps={{
                                    //     startAdornment: <InputAdornment position="start" />,
                                    // }}
                                    fullWidth /> */}
                                {row.fecha}
                            </TableCell>
                            <TableCell align='center' sx={{ p: '5px', minWidth: 100, maxWidth: 110 }}>
                                {/* <TextField
                                    variant="outlined"
                                    size='small'
                                    type='text'
                                    name="kilometros"
                                    value={row.kilometros} /> */}
                                {row.kilometros}
                            </TableCell>
                            <TableCell align='center' sx={{ p: '5px', minWidth: 300, maxWidth: 350 }}>
                                {/* <TextField
                                    variant="outlined"
                                    type='text'
                                    size='small'
                                    name="descripcion"
                                    value={row.descripcion}
                                    fullWidth /> */}
                                {row.descripcion}
                            </TableCell>
                            <TableCell align='center' sx={{ p: '5px', minWidth: 250, maxWidth: 300 }}>
                                {/* <TextField
                                    variant="outlined"
                                    type='text'
                                    size='small'
                                    name="observacion"
                                    value={row.observacion}
                                    fullWidth /> */}
                                {row.observacion}
                            </TableCell>
                            <TableCell align='center' sx={{ p: '5px', minWidth: 150, maxWidth: 180 }}>
                                {/* <TextField
                                    variant="outlined"
                                    size='small'
                                    type='date'
                                    name="proximo"
                                    value={row.fecha}
                                    fullWidth /> */}
                                {row.proximo}
                            </TableCell>
                            <TableCell align='center' sx={{ p: '5px' }}>
                                <Tooltip title="Eliminar">
                                    <IconButton
                                        onClick={() => deleteRow(row.id)}
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

export default MaintenanceTable;