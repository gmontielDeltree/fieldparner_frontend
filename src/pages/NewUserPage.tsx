import React, { useState } from 'react';
import { TextField, Button, Select, MenuItem, FormControl, InputLabel, Typography, Box, Paper, AppBar, Toolbar, SelectChangeEvent } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import ScheduleIcon from '@mui/icons-material/Schedule';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import Container from '@mui/material/Container';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { Loading } from '../components';
import { useNavigate } from 'react-router-dom';
import { useUsers, useAppSelector } from '../hooks';
import { Users } from '@types';
import Swal from 'sweetalert2';

export const NewUserPage = () => {
  const navigate = useNavigate();
  const { createUsers,updateUsers } = useUsers();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const initialForm: Users = {
    accountId: '',
    name: '',
    lastName: '',
    email: '',
    password: '',
    state: true,
    admin: false,
    language:(''),
  };

  const [formData, setFormData] = useState(initialForm);
  const {usersActive } = useAppSelector((state) => state.users);
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      console.log('Archivo seleccionado:', file);
    }
  };

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); 
    
    try {
      const formData = { ...initialForm }; // Copiar los valores de initialForm
      console.log("Valores del formulario antes de enviarlos:", formData); 
      await createUsers(formData);
      console.log("Usuario creado exitosamente");
    } catch (error) {
      console.error('Error al crear usuario:', error);
      // Aquí puedes manejar el error de acuerdo a tus necesidades
    }
  };
  
  const handleUpdateUsers = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if (!formData.accountId) return;
    
    try {
      console.log("Actualizando usuario...");
      await updateUsers(formData);
      console.log("Usuario actualizado exitosamente");
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      // Aquí puedes manejar el error de acuerdo a tus necesidades
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // const handleClick = async () => {
  //   try {
  //     const formData = initialFormData(); // Llamar a initialFormData para obtener los datos del formulario
  //     console.log("Valores del formulario:", formData); // Agregar un console.log para verificar los datos del formulario
  //     await createUsers(formData); // Pasar los datos del formulario a la función createUsers
  //   } catch (error) {
  //     console.error('Error al crear usuario:', error);
  //     // Aquí puedes manejar el error de acuerdo a tus necesidades
  //   }
  // };

  const handleCancel = () => {
    navigate('init/overview/users');
  };


  const [isLoading, setIsLoading] = useState(false);

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
                    Nuevo Usuario
                  </Typography>
                  <AddCircleIcon sx={{ fontSize: 32 }} />
                </Toolbar>
              </AppBar>
              <form>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                  <label htmlFor="file-upload" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <PhotoCameraIcon sx={{ mr: 1 }} />
                    <Typography variant="body1">Subir foto</Typography>
                    <input
                      id="file-upload"
                      name="file"
                      type="file"
                      style={{ display: 'none' }}
                      onChange={handleFileUpload}
                    />
                  </label>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ScheduleIcon sx={{ mr: 1 }} />
                  <Typography variant="body1">Última sesión</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <VpnKeyIcon sx={{ mr: 1 }} />
                  <Typography variant="body1">Cambiar clave</Typography>
                </Box>
                <TextField
                  label="Nombre"
                  type="text"
                  id="name"
                  name="name" 
                  value={formData.name}
                  onChange={handleChange}
                  required
                  fullWidth
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Apellido"
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  fullWidth
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Email"
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  fullWidth
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Password"
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  fullWidth
                  sx={{ mb: 2 }}
                />
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Idioma</InputLabel>
                  <Select
                    id="language"
                    name="language"
                    value={formData.language}
                    onChange={handleSelectChange}
                  >
                    <MenuItem value="Español">Español</MenuItem>
                    <MenuItem value="Portugués">Portugués</MenuItem>
                    <MenuItem value="Inglés">Inglés</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Rol</InputLabel>
                  <Select
                  id="role"
                  name="role"
                  value={formData.admin ? "Administrador" : "Usuario"}
                  onChange={handleSelectChange}
                >
                  <MenuItem value="Usuario">Usuario</MenuItem>
                  <MenuItem value="Administrador">Administrador</MenuItem>
                </Select>
                </FormControl>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={usersActive ? handleUpdateUsers : handleClick}
                >
                  {!usersActive ? "Actualizar" : "Agregar"}{' '}
                </Button>
                  <Button variant="outlined" color="secondary" onClick={handleCancel}>Cancelar</Button>
                </Box>
              </form>
            </Paper>
          </Container>
        
      </Container>
    </>
  );
};
