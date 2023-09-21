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
    tableCellClasses
} from '@mui/material';
import {
    Edit as EditIcon
} from '@mui/icons-material';
import { ColumnProps, Vehiculo } from '../../types';
import { useAppDispatch } from '../../hooks';
import { setVehiculoActivo } from '../../redux/vehicle';
import { useNavigate } from 'react-router-dom';


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
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

export interface VehicleTableProps {
    columns: ColumnProps[];
    data: Vehiculo[];
    isLoading: boolean;
}

export const VehicleTable: React.FC<VehicleTableProps> = ({ columns, data, isLoading }) => {

    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const onClickEditarVehiculo = (item: Vehiculo): void => {
        dispatch(setVehiculoActivo(item));
        navigate(`/init/overview/vehiculo/${item._id}`);
    }

    return (
        <TableContainer component={Paper}>
            {
                isLoading ? (
                    <Box sx={{ p: 1 }}>
                        <Skeleton variant="rounded" sx={{ width: '100%', height: 60 }} />
                        <Skeleton variant="text" sx={{ width: '100%', height: 30 }} />
                        <Skeleton variant="text" sx={{ width: '100%', height: 30 }} />
                        <Skeleton variant="text" sx={{ width: '100%', height: 30 }} />
                    </Box>
                ) : (
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
                                <StyledTableRow key={row._id} hover >
                                    <TableCellStyled align="center">{row.tipoVehiculo}</TableCellStyled>
                                    <TableCellStyled align="center">{row.marca} </TableCellStyled>
                                    <TableCellStyled align="center">{row.modelo}</TableCellStyled>
                                    <TableCellStyled>{row.patente}</TableCellStyled>
                                    <TableCellStyled align="center">{row.año}</TableCellStyled>
                                    <TableCellStyled align="center">
                                        <Tooltip title="Editar">
                                            <IconButton
                                                aria-label='Editar'
                                                onClick={() => onClickEditarVehiculo(row)} >
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCellStyled>
                                </StyledTableRow>
                            ))}
                        </TableBody>
                    </Table>
                )
            }
        </TableContainer>
    )
}
