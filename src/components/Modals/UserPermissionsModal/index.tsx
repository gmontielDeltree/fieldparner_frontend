import { Autocomplete, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Fab, Grid, Paper, TableCell, TextField } from '@mui/material';
import React, { useState } from 'react';
import { useAppDispatch, useAppSelector, useModulesPermission } from '../../../hooks';
import { ColumnProps, DisplayModals } from '../../../types';
import { uiCloseModal } from '../../../redux/ui';
import { DataTable, ItemRow } from '../../DataTable';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { UserByAccount } from '../../../types';
import { MenuModulesPermission } from '../../../interfaces/menuModules';


const columns: ColumnProps[] = [
    { text: "Modulo", align: "left" },
    { text: "Opcion Menu", align: "center" },
    { text: "Permiso", align: "center" },
];

interface SelectedUser {
    value: UserByAccount | null;
    label: string;
}
const initialSelectedUser: SelectedUser = { value: null, label: "" };

const UserPermissionsModal: React.FC = () => {

    const dispatch = useAppDispatch();
    const { showModal } = useAppSelector(state => state.ui);
    const { userActive, users } = useAppSelector(state => state.users);
    const { getModulesByUserId,
        setModulesPermissions,
        putModulesUserByUserId,
        modulesPermissions,
        isLoading, } = useModulesPermission();
    const [selectedPerfil, setSelectedPerfil] = useState(initialSelectedUser);
    const optionUsers = users.map(u => ({ value: u || "-", label: u.username || "-" }));
    const [userPermissions, setUserPermissions] = useState<MenuModulesPermission[]>([]);// listado de permisos a agregar o actualizar del usuario

    const onCloseModal = () => {
        dispatch(uiCloseModal());
        setUserPermissions([]);
        setModulesPermissions([]);
    }

    const onClickGetModules = () => {
        let userId = selectedPerfil.value ? selectedPerfil.value._id : userActive?._id;
        if (typeof (userId) === "string") getModulesByUserId(userId);
    }

    const onClickCheckPermission = (moduleDto: MenuModulesPermission, checked: boolean) => {
        //Actualizamos solamente el campo permission para visualizarlo 
        setModulesPermissions(modulesPermissions.map(m => {
            if (m.id === moduleDto.id) return { ...m, permission: checked };
            else return m
        }));
        //Agregamos en el listado solo los modulos que agrega/edita
        if (userPermissions.find(x => x.id === moduleDto.id)) {
            setUserPermissions(userPermissions.map(m => {
                if (m.id === moduleDto.id) return { ...m, permission: checked };
                else return m
            }));
        } else
            setUserPermissions([...userPermissions,
            { ...moduleDto, permission: checked }]);
    }

    const onClickConfirm = () => {
        let selectedUser = selectedPerfil.value ? selectedPerfil.value : userActive;
        if (selectedUser && selectedUser._id) {
            putModulesUserByUserId(selectedUser._id, userPermissions);
            onCloseModal();
        }
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
                                value={selectedPerfil}
                                onChange={(_e, value, _reason, _details) => {
                                    if (value) setSelectedPerfil({ value: value.value, label: value.value?.username || "" });
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
                                        checked={moduleDto.permission}
                                        onChange={(_e, checked) => onClickCheckPermission(moduleDto, checked)}
                                    />
                                </TableCell>
                            </ItemRow>
                        ))}
                    </DataTable>
                </Paper>
            </DialogContent>
            <DialogActions>
                <Grid container sx={{ px: 2 }}>
                    <Grid item xs={12} sm={6} display="flex" justifyContent="center">
                        <Button variant="outlined" color="secondary" onClick={() => onCloseModal()}>
                            Cerrar
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={6} display="flex" justifyContent="center">
                        <Button
                            variant="contained"
                            color="success"
                            disabled={userPermissions.length === 0}
                            onClick={() => onClickConfirm()}>
                            Confirmar
                        </Button>
                    </Grid>
                </Grid>
            </DialogActions>
        </Dialog>
    )
}

export default UserPermissionsModal;