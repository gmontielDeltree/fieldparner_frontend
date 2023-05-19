
import React from 'react';
import { AppLayout } from '../components';
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
import { Presupuestos } from '../types';
import {
    ContentCopy as ContentCopyIcon,
    Delete as DeleteIcon,
    Edit as EditIcon
} from '@mui/icons-material';



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

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

export interface ColumnProps {
    text: string;
    align: 'inherit' | 'left' | 'center' | 'right' | 'justify';
}

const columns: ColumnProps[] = [
    { text: 'Nro', align: 'left' },
    { text: 'Proveedor/Cliente', align: 'center' },
    { text: 'Estado', align: 'center' },
    { text: 'Moneda', align: 'center' },
    { text: 'Total Presupuesto', align: 'center' }];

const data: Presupuestos[] = [
    { nro: '00100', proveedor: 'CONSUMIDOR FINAL', estado: false, moneda: '$', totalPresupuesto: '289.800,70' },
    { nro: '00101', proveedor: 'CONSUMIDOR FINAL', estado: false, moneda: '$', totalPresupuesto: '289.800,70' },
    { nro: '00102', proveedor: 'CONSUMIDOR FINAL', estado: false, moneda: '$', totalPresupuesto: '289.800,70' },
    { nro: '00103', proveedor: 'CONSUMIDOR FINAL', estado: false, moneda: '$', totalPresupuesto: '289.800,70' },
    { nro: '00104', proveedor: 'CONSUMIDOR FINAL', estado: false, moneda: '$', totalPresupuesto: '289.800,70' },
];

export const OverviewPage: React.FC = () => {
    return (
        <AppLayout>
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
                            <StyledTableRow key={row.nro}>
                                <TableCellStyled component="th" scope="row">
                                    {row.nro}
                                </TableCellStyled>
                                <TableCellStyled align="center">{row.proveedor}</TableCellStyled>
                                <TableCellStyled align="center">
                                    <Chip
                                        label="Activo"
                                        variant='outlined'
                                        color='success' />
                                </TableCellStyled>
                                <TableCellStyled align="center">{row.moneda}</TableCellStyled>
                                <TableCellStyled align="center">{row.totalPresupuesto}</TableCellStyled>
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
        </AppLayout>
    )
}
