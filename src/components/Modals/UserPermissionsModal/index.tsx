import { Autocomplete, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Fab, Grid, Paper, TableCell, TextField } from '@mui/material';
import React, { useState } from 'react';
import { useAppDispatch, useAppSelector, useMenuModules } from '../../../hooks';
import { ColumnProps, DisplayModals } from '../../../types';
import { uiCloseModal } from '../../../redux/ui';
import { DataTable, ItemRow } from '../../DataTable';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { UserByAccount } from '../../../types';


const columns: ColumnProps[] = [
    { text: "Modulo", align: "left" },
    { text: "Opcion Menu", align: "center" },
    { text: "Permiso", align: "center" },
];

//TODO: hacer el listado de menu modules con la prop isChecked, aplicaria para un nuevo listado o un listado de un usuario con permisos
const UserPermissionsModal: React.FC = () => {

    const dispatch = useAppDispatch();
    const { showModal } = useAppSelector(state => state.ui);
    const { userActive, users } = useAppSelector(state => state.users);
    const { getMenuModulesByUserId, modulesPermissions, isLoading } = useMenuModules();
    const [selectedPerfil, setSelectedPerfil] = useState<UserByAccount | null>(null);

    const optionUsers = users.map(u => ({ value: u || "-", label: u.username || "-" }));

    const onCloseModal = () => dispatch(uiCloseModal());

    const onClickGetModules = () => {
        console.log('onClickGetModules');
        let userId = selectedPerfil ? selectedPerfil._id : userActive?._id;
        if (typeof (userId) === "string") getMenuModulesByUserId(userId);

    }

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
                                value={!selectedPerfil ? { value: null, label: "" } : { value: selectedPerfil, label: selectedPerfil.username || "" }}
                                onChange={(_e, value, _reason, _details) => {
                                    if (value) setSelectedPerfil(value.value);
                                }}
                                options={optionUsers}
                                getOptionLabel={(option) => option.label}
                                renderInput={(params) => (
                                    <TextField {...params} label="Copiar perfil de usuario" variant="outlined" />
                                )}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={6} sm={6} display="flex" alignItems="center">
                            <Fab size="small" color="success" aria-label="add" onClick={() => onClickGetModules()}>
                                <PlayArrowIcon />
                            </Fab>
                        </Grid>
                    </Grid>
                </Paper>
                <Paper elevation={1} sx={{
                    width: "100%", overflow: "hidden"
                }}>
                    <DataTable
                        key="table-user-permissions"
                        columns={columns}
                        isLoading={isLoading}
                    >
                        {modulesPermissions.map((moduleDto) => (
                            <ItemRow key={moduleDto._id} hover>
                                <TableCell align="left">
                                    {moduleDto.module}
                                </TableCell>
                                <TableCell align="center">
                                    {moduleDto.menuOption}
                                </TableCell>
                                <TableCell align="center">
                                    <Checkbox
                                        // name="Siembra"
                                        checked={moduleDto.permission}
                                        onChange={(_e, checked) => { console.log(checked) }}
                                    />
                                </TableCell>
                            </ItemRow>
                        ))}
                    </DataTable>
                </Paper>
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