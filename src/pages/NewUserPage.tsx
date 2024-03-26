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
    Grid, 
    IconButton, 
    InputAdornment, 
    InputLabel, 
    MenuItem, 
    Paper, 
    Select, 
    TextField, 
    Toolbar, 
    Typography 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector, useForm, useUsers } from '../hooks';
import { Loading } from '../components';
import { UserByAccount } from '@types';
import { v4 as uuidv4 } from 'uuid';
import { removeUsersActive } from '../redux/users';
import { 
AddCircle as AddCircleIcon,
BrokenImage as BrokenImageIcon,
Cancel as CancelIcon,
PersonAdd as PersonAddIcon,
PhotoCamera as PhotoCameraIcon,
Schedule as ScheduleIcon,
VpnKey as VpnKeyIcon } from '@mui/icons-material';




export const NewUserPage = () => {
  const navigate = useNavigate();
  const { createUsers,updateUsers,updatePasswordUsers } = useUsers();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [showChangePassword, setShowChangePassword] = useState<boolean>(false);
  const [ultimaConexion, setUltimaConexion] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAppSelector((state) => state.auth);
  const [passwordError, setPasswordError] = useState<string>('');
  const initialForm: UserByAccount = {
    userId: '',
    name: '',
    lastName: '',
    email: '',
    password: '',
    state: true,
    language: '',
    photoFile: null,
    admin: false,
    accountId: '', // Aquí inicializas accountId con una cadena vacía
};


  const {usersActive } = useAppSelector((state) => state.users);
  const {
    formulario,
    setFormulario,
    handleInputChange: handleFormInputChange,
    handleSelectChange,
  
    reset,
  } = useForm(initialForm);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    
   
  if (name === 'password' && !usersActive) {
    
    if (!/(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}/.test(value)) {
      setPasswordError('La contraseña debe contener al menos una letra en mayúscula, un dígito, un carácter especial y tener una longitud mínima de 8 caracteres.');
    } else {
      setPasswordError('');
    }
  }

  
  handleFormInputChange(event);
};
  
  useEffect(() => {
    if (usersActive) {
      setFormulario(usersActive);
      if (usersActive.photoFile) {
        
        const reader = new FileReader();
        reader.onload = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(usersActive.photoFile);
      } else {
        setPreviewUrl(null);
      }
    } else {
      setFormulario(initialForm);
      setPreviewUrl(null);
    }
  }, [usersActive, setFormulario]);

  useEffect(() => {
   
    const fechaActual = new Date();
    setUltimaConexion(fechaActual);
  }, []);

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      console.error('Las contraseñas no coinciden');
      return;
    }
  
    try {
     
      await updatePasswordUsers({
        userId: '',
        password: newPassword, // Aquí cambia de accountId a password
        name: '',
        email: '',
        state: false,
        admin: false,
        lastName: '',
        language: '',
        accountId: ''
      }, oldPassword);
    } catch (error) {
      console.error('Error al actualizar la contraseña:', error);
      // Manejar el error según sea necesario
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setFormulario({
        ...formulario,
        photoFile: file
      });
    }
  };

  const handleCancel = () => {
    
    setPreviewUrl(null);
  };
  
  const  handleUpdateUsers = () => {
    if (formulario._id) {
      updateUsers(formulario);
      dispatch(removeUsersActive());
      navigate("/init/overview/users");
    }
  };



  const handleAddUser = () => {
    const newUserId = uuidv4(); 
    const newUser = { ...formulario, userId: newUserId, accountId: user ? user.accountId : '' };
    createUsers(newUser);
    navigate("/init/overview/users");
    reset();
};



  const onClickCancel = () => {
    dispatch(removeUsersActive());
   navigate("/init/overview/users");
   setIsLoading(true);
   reset();
  };

  if (user && user.isAdmin) {
    return (
    <>
      <Container maxWidth="lg">
      <Loading key="loading-users" loading={isLoading} />
      <Box className="text-center">
      </Box>
      <Typography
        component="h1"
        variant="h4"
        align="left"
        sx={{ mt: 1, mb: 7 }}
      >
        <PersonAddIcon sx={{ marginRight: '8px', fontSize: 'inherit', verticalAlign: 'middle' }} />
        Crear Usuario
      </Typography>
      <Container maxWidth="md" sx={{ mb: 4 }}>
        <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                {usersActive ? "Editar" : "Nuevo" } Usuario
              </Typography>
              <AddCircleIcon sx={{ fontSize: 32 }} />
            </Toolbar>
          </AppBar>
          <form>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
              <Card>
                {previewUrl ? (
                  <CardMedia
                    component="img"
                    alt="Vista previa de la imagen"
                    height="140"
                    image={previewUrl}
                    sx={{ objectFit: 'contain' }} 
                  />
                ) : (
                  <Box sx={{ width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BrokenImageIcon fontSize="large" color="disabled" />
                  </Box>
                )}
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label htmlFor="file-upload" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer'}}>
                      <PhotoCameraIcon sx={{ mr: 1 }} />
                      <Typography variant="body1" sx={{ p: 0 }}>Subir foto</Typography>
                      <input
                        id="file-upload"
                        name="file"
                        type="file"
                        style={{ display: 'none' }}
                        onChange={handleFileUpload}
                      />
                    </label>
                    {previewUrl && (
                      <IconButton onClick={handleCancel} color="error" sx={{ p: 0 }}>
                        <CancelIcon fontSize="large" />
                      </IconButton>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <ScheduleIcon sx={{ mr: 1 }} />
      <Typography variant="body1">Última sesión:</Typography>
      {ultimaConexion && (
        <Typography variant="body1" sx={{ ml: 1 }}>{ultimaConexion.toLocaleString()}</Typography>
      )}
    </Box>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }} > 
              
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
                <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <TextField
                        label="Clave anterior"
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        fullWidth
                        sx={{ mb: 2 }} />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        label="Nueva clave"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        fullWidth
                        sx={{ mb: 2 }} />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        label="Repetir nueva clave"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        fullWidth
                        sx={{ mb: 2 }} />
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
            </Box>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <TextField
                    label="Nombre"
                    type="text"
                    id="name"
                    name="name" 
                    value={formulario.name}
                    onChange={handleInputChange}
                    required
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    label="Apellido"
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formulario.lastName}
                    onChange={handleInputChange}
                    required
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={4}>
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
                <Grid item xs={3}>
                  <TextField
                  variant="outlined"
                  type="password"
                  label="Contraseña"
                  name="password"
                  value={formulario.password}
                  onChange={handleInputChange}
                  fullWidth
                  sx={{ mb: 2 }}
                  error={!!passwordError}
                  helperText={passwordError}
                />
                </Grid>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', mb: 1 }}>
                    <Typography variant="body1" sx={{ mb: 1 }}>Usuario activo</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                      <FormControlLabel
                        control={<Checkbox color="primary" />}
                        label="Sí"
                        labelPlacement="start"
                        name="userState"
                        checked={formulario.state === true}
                        onChange={() => setFormulario({ ...formulario, state: true })}
                      />
                      <FormControlLabel
                        control={<Checkbox color="primary" />}
                        label="No"
                        labelPlacement="start"
                        name="userState"
                        checked={formulario.state === false}
                        onChange={() => setFormulario({ ...formulario, state: false })}
                      />
                    </Box>
                  </Box>
                </Box>
              </Grid>
              <Grid container spacing={2}>
              <Grid item xs={2}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Idioma</InputLabel>
                  <Select
                    id="language"
                    name="language"
                    value={formulario.language}
                    onChange={handleSelectChange}
                  >
                    <MenuItem value="Español">Español</MenuItem>
                    <MenuItem value="Portugués">Portugués</MenuItem>
                    <MenuItem value="Inglés">Inglés</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={3}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Rol</InputLabel>
                  <Select
                    id="admin" 
                    name="admin" 
                    value={formulario.admin ? "Usuario" : "Administrador"}
                    onChange={handleSelectChange}
                  >
                    <MenuItem value="Usuario">Usuario</MenuItem>
                    <MenuItem value="Administrador">Administrador</MenuItem>
                  </Select>
                </FormControl>
                </Grid>
              </Grid>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={usersActive ? handleUpdateUsers : handleAddUser}
                >
                  {!usersActive ? "Agregar" : "Actualizar"}{' '}
                </Button>
                <Button variant="outlined" color="secondary" onClick={onClickCancel}>Cancelar</Button>
              </Box>
            </form>
          </Paper>
        </Container>
      </Container>
    </>
  );
} else {
  return null;
}
};
