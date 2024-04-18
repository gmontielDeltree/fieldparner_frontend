import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Toolbar,
  Tooltip,
  Typography
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector, useForm, useUser } from '../hooks';
import { Loading } from '../components';
import { UserByAccount, UserRols } from '../types';
// import { v4 as uuidv4 } from 'uuid';
import { removeUsersActive } from '../redux/users';
import {
  AddCircle as AddCircleIcon,
  BrokenImage as BrokenImageIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
  Schedule as ScheduleIcon,
  VpnKey as VpnKeyIcon,
  People as PeopleIcon,
  Edit as EditIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import uuid4 from 'uuid4';
import { uploadFile } from '../helpers/fileUpload';
import { urlImg } from '../config';


const initialForm: UserByAccount = {
  name: '',
  lastName: '',
  email: '',
  password: '',
  language: '',
  isAdmin: false,
  accountId: '',
  state: false,
  rol: UserRols.User,
  photoName: "",
};

//TODO: enviar la actualizacion de usuario, incluido si quiere password nueva .
const policyPassword = "La contraseña debe contener al menos una letra en mayúscula, un dígito, un carácter especial y tener una longitud mínima de 8 caracteres.";

export const NewUserPage = () => {
  const { id: userId } = useParams();
  const navigate = useNavigate();
  const { isLoading, createUser, updateUser, getUserById } = useUser();
  const dispatch = useAppDispatch();
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  // const [oldPassword, setOldPassword] = useState<string>('');
  // const [newPassword, setNewPassword] = useState<string>('');
  const [showChangePassword, setShowChangePassword] = useState<boolean>(false);
  const [ultimaConexion, setUltimaConexion] = useState(new Date());
  // const { user } = useAppSelector((state) => state.auth);
  const [passwordError, setPasswordError] = useState<string>('');
  const { userActive } = useAppSelector((state) => state.users);
  const {
    photoName,
    formulario,
    setFormulario,
    handleInputChange,
    handleSelectChange,
    reset,
  } = useForm(initialForm);

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (name === 'password') {
      handleInputChange(event);
      if (!/(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}/.test(value)) { setPasswordError('La contraseña no cumple con con los requisitos.'); return; }
      else
        setPasswordError('');
    };
    if (name === "confirmPassword") {
      setConfirmPassword(value);
      if (formulario.password !== value) {
        setPasswordError("Las contraseñas no coinciden.");
        return;
      } else
        setPasswordError("");
    }
  }

  const handleUpdatePassword = async () => {
    if (formulario._id) {
      updateUser(formulario);
      dispatch(removeUsersActive());
      navigate("/init/overview/users");
    }
  };

  // const onChangeConfirmPass = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setConfirmPassword(e.target.value);
  //   if (formulario.password !== e.target.value) {
  //     setPasswordError("Las contraseñas no coinciden.");
  //     return;
  //   }
  //   setPasswordError("");
  // }

  const uploadImgUser = async (fileInput: Blob) => {
    try {
      const newFileName = `${uuid4()}.jpeg`; // Nuevo nombre del archivo
      const renamedFile = new File([fileInput], newFileName, { type: fileInput.type });
      const response = await uploadFile(renamedFile);

      if (response)
        setFormulario(({ ...formulario, photoName: newFileName }));
      else
        setFormulario(({ ...formulario, photoName: "" }));

    } catch (error) {
      console.log('error', error)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) uploadImgUser(file);
  };

  const handleCancel = () => {
    setFormulario(({ ...formulario, photoName: "" }));
  };

  const handleUpdateUsers = () => {
    if (formulario._id) {
      updateUser(formulario);
      dispatch(removeUsersActive());
      navigate("/init/overview/users");
    }
  };

  const handleAddUser = async () => {
    await createUser(formulario);
    navigate("/init/overview/users");
    reset();
  };

  const onClickCancel = () => {
    dispatch(removeUsersActive());
    navigate("/init/overview/users");
    // setIsLoading(true);
    reset();
  };

  const onChangeConfirmNewPassword = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(target.value);
    if (formulario.newPassword !== target.value)
      setPasswordError("Las contraseñas no coinciden.");
    else
      setPasswordError("");
  }

  useEffect(() => {
    if (userActive) {
      setFormulario(userActive);
    } else {
      setFormulario(initialForm);
    }
  }, [userActive, setFormulario]);

  useEffect(() => {
    const fechaActual = new Date();
    setUltimaConexion(fechaActual);
  }, []);

  useEffect(() => {
    if (userId) {
      getUserById(userId);
    }
  }, [userId])

  return (
    <>
      <Container maxWidth="md" sx={{
        mt: 4,
        p: { sm: 1, md: 1 },
        mb: 1,
        ml: 5
      }}>
        <Loading key="loading-users" loading={isLoading} />
        <Typography
          component="h1"
          variant="h4"
          align="left"
          sx={{ mt: 3, mb: 3 }}
        >
          <PeopleIcon sx={{ marginRight: '8px', fontSize: 'inherit', verticalAlign: 'middle' }} />
          Usuarios
        </Typography>
        <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
          <AppBar position="static">
            <Toolbar>
              {
                userActive ? <EditIcon fontSize='medium' /> : <AddCircleIcon fontSize='medium' />
              }
              <Typography variant="h6" component="div" sx={{ flexGrow: 1, ml: 2 }}>
                {userActive ? "Editar" : "Nuevo"} Usuario
              </Typography>
            </Toolbar>
          </AppBar>
          <form>
            <Grid container spacing={1} p={1} mt={1}>
              <Grid container direction="column" xs={7}>
                <Grid container spacing={1.5} sx={{ pt: 6 }}>
                  <Grid item xs={6}>
                    <TextField
                      label="Nombre"
                      type="text"
                      name="name"
                      value={formulario.name}
                      onChange={handleInputChange}
                      required
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Apellido"
                      type="text"
                      name="lastName"
                      value={formulario.lastName}
                      onChange={handleInputChange}
                      required
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Email"
                      type="email"
                      id="email"
                      name="email"
                      value={formulario.email}
                      onChange={handleInputChange}
                      placeholder='correo@gmail.com'
                      required
                      fullWidth
                      InputProps={{
                        startAdornment: <InputAdornment position="start" />,
                      }}
                    />
                  </Grid>
                  {!userActive &&
                    <>
                      <Grid item xs={6}>
                        <TextField
                          label="Contraseña"
                          type="password"
                          name="password"
                          // error={!!passwordError}
                          value={formulario.password}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">
                              <Tooltip title={policyPassword}>
                                <InfoIcon />
                              </Tooltip>
                            </InputAdornment>,
                          }}
                          onChange={handlePasswordChange}
                          fullWidth />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          label="Repetir contraseña"
                          type="password"
                          name="confirmPassword"
                          error={!!passwordError}
                          helperText={passwordError}
                          value={confirmPassword}
                          onChange={handlePasswordChange}
                          fullWidth />
                      </Grid>
                    </>
                  }
                  <Grid item xs={4}>
                    <FormControl fullWidth >
                      <InputLabel>Idioma</InputLabel>
                      <Select
                        id="language"
                        name="language"
                        label="Idioma"
                        value={formulario.language}
                        onChange={handleSelectChange}
                      >
                        <MenuItem value="Español">Español</MenuItem>
                        <MenuItem value="Portugués">Portugués</MenuItem>
                        <MenuItem value="Inglés">Inglés</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={4}>
                    <FormControl fullWidth >
                      <InputLabel>Rol</InputLabel>
                      <Select
                        id="admin"
                        name="rol"
                        label="Rol"
                        value={formulario.rol}
                        onChange={handleSelectChange}
                      >
                        <MenuItem value={UserRols.User}>Usuario</MenuItem>
                        <MenuItem value={UserRols.Administrator}>Administrador</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={4}>
                    <FormLabel id='user-active'>Usuario Activo</FormLabel>
                    <FormGroup id="user-active" row>
                      <FormControlLabel
                        key="yes"
                        control={
                          <Checkbox
                            name="yes"
                            checked={formulario.state}
                            onChange={() => setFormulario({ ...formulario, state: true })}
                          />
                        }
                        label={"Si"}
                        labelPlacement="start"
                      />
                      <FormControlLabel
                        key="not"
                        control={
                          <Checkbox
                            name="not"
                            checked={!formulario.state}
                            onChange={() => setFormulario({ ...formulario, state: false })}
                          />
                        }
                        label={"No"}
                        labelPlacement="start"
                      />
                    </FormGroup>
                  </Grid>
                </Grid>
              </Grid>
              <Grid container direction="column" xs={5}>
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: "center", alignItems: 'center', mb: 2 }}>
                  <Card sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    width: 200,
                    height: 240,
                    maxWidth: 200,
                    maxHeight: 240
                  }}>
                    {photoName ? (
                      <CardMedia
                        key="preview-img"
                        component="img"
                        alt="Vista previa de la imagen"
                        image={`${urlImg}/${photoName}`}
                        sx={{
                          maxHeight: 150,
                          maxWidth: 150,
                          objectFit: "cover",
                          borderRadius: "60%"
                        }}
                      />
                    ) : (
                      <Box sx={{ width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BrokenImageIcon fontSize="large" color="disabled" />
                      </Box>
                    )}
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                        <label htmlFor="file-upload" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                          <PhotoCameraIcon sx={{ mr: 1 }} />
                          <Typography variant="body1" sx={{ p: 0 }}>Subir foto</Typography>
                          <input
                            id="file-upload"
                            key="file-user"
                            accept="image/*"
                            name="file"
                            type="file"
                            style={{ display: 'none' }}
                            onChange={handleFileUpload}
                          />
                        </label>
                        {photoName && (
                          <IconButton onClick={handleCancel} color="error" sx={{ p: 0, pl: 1 }}>
                            <CancelIcon fontSize="medium" />
                          </IconButton>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
                {userActive && <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: "center", alignItems: 'center' }} >
                    <Button
                      variant="text"
                      color="secondary"
                      onClick={() => setShowChangePassword(!showChangePassword)}
                      startIcon={<VpnKeyIcon />}
                      sx={{ border: '1px solid', borderColor: '-moz-initial', borderRadius: '5px', padding: '8px 16px' }}
                    >
                      Cambiar clave
                    </Button>
                  </Box>
                  {showChangePassword && (
                    <>
                      <Grid container direction="column" sx={{ mt: 1 }} spacing={1}>
                        <Grid item xs={4}>
                          <TextField
                            label="Clave anterior"
                            type="password"
                            name="previousPassword"
                            value={formulario.previousPassword}
                            onChange={handleInputChange}
                            fullWidth />
                        </Grid>
                        <Grid item xs={4}>
                          <TextField
                            label="Nueva clave"
                            type="password"
                            name="newPassword"
                            value={formulario.newPassword}
                            onChange={handleInputChange}
                            fullWidth />
                        </Grid>
                        <Grid item xs={4}>
                          <TextField
                            label="Repetir nueva clave"
                            type="password"
                            value={confirmPassword}
                            error={!!passwordError}
                            helperText={passwordError}
                            onChange={onChangeConfirmNewPassword}
                            fullWidth />
                        </Grid>
                      </Grid><Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                        <Button variant="contained" color="primary" onClick={handleUpdatePassword}>
                          Confirmar
                        </Button>
                        <Button variant="outlined" color="secondary" onClick={() => setShowChangePassword(!showChangePassword)}>
                          Cancelar
                        </Button>
                      </Box>
                    </>
                  )}
                </Box>}
                <Box sx={{ display: 'flex', justifyContent: "center", alignItems: 'center', mb: 2 }}>
                  <ScheduleIcon sx={{ mr: 1 }} />
                  <Typography variant="body1">Última sesión:</Typography>
                  {ultimaConexion && (
                    <Typography variant="body1" sx={{ ml: 1 }}>{ultimaConexion.toLocaleString()}</Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', mt: 2 }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={onClickCancel}>
                Cancelar
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={userActive ? handleUpdateUsers : handleAddUser}
              >
                {!userActive ? "Guardar" : "Actualizar"}{' '}
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
    </>
  );
};
