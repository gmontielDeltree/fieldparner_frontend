// import * as React from 'react';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Checkbox, Fab, IconButton, TextField, Tooltip } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, } from '@mui/icons-material';
import { Mantenimiento } from '@types';
import { useForm } from '../../hooks';

import uuid4 from 'uuid4';


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

const StyledTableRow = styled(TableRow)(() => ({
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
    updateMaintenance: (id: string, updatedMaintenance: Mantenimiento) => void;
}

const initialState: Mantenimiento = {
    id: '',
    fechaCreado: '',
    kilometros: 0,
    descripcion: '',
    observacion: '',
    fechaProximoMantenimiento: '',
    realizado: false
};

const MaintenanceTable: React.FC<MaintenanceTableProps> = ({
    columns,
    rows,
    handleAddRow,
    deleteRow,
    updateMaintenance
}) => {

    const { fechaCreado,
        kilometros,
        descripcion,
        observacion,
        fechaProximoMantenimiento,
        formulario,
        realizado,
        reset,
        handleInputChange,
        handleCheckboxChange } = useForm<Mantenimiento>(initialState);

    const handleAddMantenimiento = (): void => {
        if (!fechaCreado && (kilometros !== 0) && !descripcion && !fechaProximoMantenimiento) return;
        handleAddRow({ ...formulario, id: uuid4() });
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
                        <StyledTableCell />
                    </TableRow>
                </TableHead>
                <TableBody>
                    <StyledTableRow key="new-maintenace">
                        <StyledTableCell align='center' sx={{ minWidth: 150, maxWidth: 180 }}>
                            <Checkbox
                                name="realizado"
                                checked={realizado}
                                onChange={handleCheckboxChange}
                            />
                        </StyledTableCell>
                        <StyledTableCell sx={{ minWidth: 150, maxWidth: 180 }}>
                            <TextField
                                variant="outlined"
                                size='small'
                                type='date'
                                name="fechaCreado"
                                value={fechaCreado}
                                onChange={handleInputChange}
                                fullWidth />
                        </StyledTableCell>
                        <StyledTableCell sx={{ minWidth: 100, maxWidth: 110 }}>
                            <TextField
                                variant="outlined"
                                size='small'
                                type='number'
                                name="kilometros"
                                inputProps={{ min: '0' }}
                                value={(kilometros === 0) ? '' : kilometros}
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
                                name="fechaProximoMantenimiento"
                                value={fechaProximoMantenimiento}
                                onChange={handleInputChange}
                                fullWidth />
                        </StyledTableCell>
                        <StyledTableCell key="actions" align='center'>
                            <Fab
                                color="success"
                                aria-label="add"
                                size='small'
                                disabled={!fechaCreado || (kilometros === 0) || !descripcion || !fechaProximoMantenimiento}
                                onClick={handleAddMantenimiento}
                            >
                                <AddIcon />
                            </Fab>
                        </StyledTableCell>
                    </StyledTableRow>
                    {rows.map((row) => (
                        <StyledTableRow key={row.id}>
                            <TableCell align='center' sx={{ p: '5px', minWidth: 100, maxWidth: 100 }}>
                                {<Checkbox
                                    name="realizado"
                                    checked={row.realizado}
                                    onChange={(_e, checked) => {
                                        updateMaintenance(row.id, { ...row, realizado: checked });
                                    }}
                                />}
                            </TableCell>
                            <TableCell
                                align='center'
                                sx={{
                                    p: '5px',
                                    minWidth: 150,
                                    maxWidth: 180
                                }}>
                                {row.fechaCreado}
                            </TableCell>
                            <TableCell align='center' sx={{ p: '5px', minWidth: 100, maxWidth: 110 }}>
                                {row.kilometros}
                            </TableCell>
                            <TableCell align='center' sx={{ p: '5px', minWidth: 300, maxWidth: 350 }}>
                                {row.descripcion}
                            </TableCell>
                            <TableCell align='center' sx={{ p: '5px', minWidth: 250, maxWidth: 300 }}>
                                {row.observacion}
                            </TableCell>
                            <TableCell align='center' sx={{ p: '5px', minWidth: 150, maxWidth: 180 }}>
                                {row.fechaProximoMantenimiento}
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