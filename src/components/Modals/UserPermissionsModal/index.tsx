import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import React from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { ColumnProps, DisplayModals } from '../../../types';
import { uiCloseModal } from '../../../redux/ui';
import { DataTable } from '../../DataTable';


const columns: ColumnProps[] = [
    { text: "Modulo", align: "left" },
    { text: "Opcion Menu", align: "center" },
    { text: "Permiso", align: "center" },
];


const UserPermissionsModal: React.FC = () => {

    const dispatch = useAppDispatch();
    const { showModal } = useAppSelector(state => state.ui);

    const onCloseModal = () => dispatch(uiCloseModal());

    return (
        <Dialog
            open={showModal === DisplayModals.UserPermissions}
            maxWidth="lg"
            scroll="paper"
            onClose={() => onCloseModal()}
        >
            <DialogTitle variant="h5">Asignacion Permisos</DialogTitle>
            <DialogContent>
                <DataTable
                    key="detail-deposits-datable"
                    columns={columns}
                    isLoading={false}
                >
                    {/* {supplyByDeposit.nroLotsStock?.map((lotStock) => (
                        <ItemRow key={lotStock.nroLot} hover>
                            <TableCellStyled align="left">
                                {lotStock.location}
                            </TableCellStyled>
                        </ItemRow>
                    ))} */}
                </DataTable>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" color="primary" onClick={() => onCloseModal()}>
                    Cerrar
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default UserPermissionsModal;