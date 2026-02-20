import React from 'react';
import { TransportDocumentByCertificateDeposit } from '../../../interfaces/certificate-deposit';
import { ItemRow } from '../../DataTable';
import { IconButton, TableCell } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

interface TransportDocumentRowProps {
    item: TransportDocumentByCertificateDeposit;
    onDelete: (item: TransportDocumentByCertificateDeposit) => void;
}

export const TransportDocumentRow: React.FC<TransportDocumentRowProps> = ({
    item,
    onDelete
}) => {

    return (
        <ItemRow key={item.numeroCartaPorte} hover>
            <TableCell align="left">
                {item.numeroCartaPorte}
            </TableCell>
            <TableCell align="center">
                {item.fechaCartaPorte}
            </TableCell>
            <TableCell align="center">
                {item.kgNeto.toLocaleString()}
            </TableCell>
            <TableCell align="center">
                {item.kgMermaZarandeo.toLocaleString()}
            </TableCell>
            <TableCell align="center">
                $ {item.tarifaZarandeo.toLocaleString()}
            </TableCell>
            <TableCell align="center">
                $ {item.importeZarandeo.toLocaleString()}
            </TableCell>
            <TableCell align="center">
                {item.humedadSecado}
            </TableCell>
            <TableCell align="center">
                {item.kgMermaSecado.toLocaleString()}
            </TableCell>
            <TableCell align="center">
                $ {item.tarifaSecado.toLocaleString()}
            </TableCell>
            <TableCell align="center">
                $ {item.importeSecado.toLocaleString()}
            </TableCell>
            <TableCell align="center">
                <IconButton onClick={() => onDelete(item)} color="inherit" size='small'>
                    <DeleteIcon fontSize='medium' />
                </IconButton>
            </TableCell>
        </ItemRow>
    )
}
