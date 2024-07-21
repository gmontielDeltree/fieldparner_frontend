import { Autocomplete, Button, Dialog, DialogActions, DialogContent, DialogTitle, Fab, Grid, Paper, TextField } from '@mui/material';
import React, { useState } from 'react';
import { useAppDispatch, useAppSelector, useMenuModules } from '../../../hooks';
import { ColumnProps, DisplayModals } from '../../../types';
import { uiCloseModal } from '../../../redux/ui';
import { DataTable } from '../../DataTable';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';


const columns: ColumnProps[] = [
    { text: "Modulo", align: "left" },
    { text: "Opcion Menu", align: "center" },
    { text: "Permiso", align: "center" },
];


const UserPermissionsModal: React.FC = () => {

    const dispatch = useAppDispatch();
    const { showModal } = useAppSelector(state => state.ui);
    const { userActive, users } = useAppSelector(state => state.users);
    // const { getMenuModules, menuModules } = useMenuModules();
    const [selectedPerfil, setSelectedPerfil] = useState(null);

    const optionUsers = users.map(u => ({ value: u || "-", label: u.username || "-" }));

    const onCloseModal = () => dispatch(uiCloseModal());

    return (
        <Dialog
            open={showModal === DisplayModals.UserPermissions}
            maxWidth="md"
            fullWidth
            scroll="paper"
            onClose={() => onCloseModal()}
        >
            <DialogTitle variant="h5">Asignacion Permisos</DialogTitle>
            <DialogContent>
                <Paper elevation={1} sx={{ minHeight: "150px", p: 1, my: 1 }}>
                    <Grid container spacing={1} >
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Usuario"
                                value={userActive?.username}
                                variant='outlined'
                                fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="email"
                                value={userActive?.email}
                                variant='outlined'
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Autocomplete
                                value={selectedPerfil}
                                onChange={(e, value, reason, details) => console.log({ e, value, reason, details })}
                                options={optionUsers}
                                getOptionLabel={(option) => option.label}
                                renderInput={(params) => (
                                    <TextField {...params} label="Copiar perfil de usuario" variant="outlined" />
                                )}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={6} sm={6} display="flex" alignItems="center">
                            <Fab size="small" color="success" aria-label="add">
                                <PlayArrowIcon />
                            </Fab>
                        </Grid>
                    </Grid>
                </Paper>

                <DataTable
                    key="detail-deposits-datable"
                    columns={columns}
                    isLoading={false}
                >

                    {/* {[""].map((lotStock) => (
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