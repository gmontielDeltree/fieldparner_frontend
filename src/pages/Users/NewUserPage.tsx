import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  FormControl,
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
  Typography,
  Stepper,
  Step,
  StepLabel,
  Alert,
  AlertTitle,
  Divider,
  Chip,
  Avatar,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector, useForm, useFormError, useMenuModules, useUser } from '../../hooks';
import { Loading, ModulePermissionsSelector } from '../../components';
import { UserRole } from '../../types';
// import { v4 as uuidv4 } from 'uuid';
import { removeUsersActive } from '../../redux/users';
import {
  AddCircle as AddCircleIcon,
  BrokenImage as BrokenImageIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
  // Schedule as ScheduleIcon,
  Edit as EditIcon,
  Info as InfoIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Check as CheckIcon,
  Lock as LockIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { uploadFile } from '../../helpers/fileUpload';
import { urlImg } from '../../config';
import { NewUserDto } from '../../interfaces/user-accounts';
import { useTranslation } from 'react-i18next';


const initialForm: NewUserDto = {
  username: '',
  email: '',
  language: '',
  password: '',
  rol: UserRole.USER,
  photoName: "",
  modulePermissions: [],
};


const policyPassword = "La contraseña debe contener al menos una letra en mayúscula, un dígito, un carácter especial y tener una longitud mínima de 8 caracteres.";
// const statusOptions = Object.values(EnumStatusUser).map(x => x as string);

const steps = ['Información del Usuario', 'Permisos y Módulos', 'Revisión y Confirmación'];

export const NewUserPage = () => {
  const navigate = useNavigate();
  const { isLoading, createUser } = useUser();
  const dispatch = useAppDispatch();
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [filePhoto, setFilePhoto] = useState<{ url: string; file: File | null }>({
    url: "",
    file: null
  });
  const [activeStep, setActiveStep] = useState(0);
  const { formControlError, handleFormValueChange } = useFormError({
    password: "",
    confirmPassword: "",
    newPassword: "",
  });
  const { userActive } = useAppSelector((state) => state.users);
  // const { user: authUser } = useAppSelector((state) => state.auth);
  const {
    photoName,
    formulario,
    setFormulario,
    handleInputChange,
    handleSelectChange,
    reset,
  } = useForm(initialForm);
  const { t } = useTranslation();

  const { menuModules, getMenuModules } = useMenuModules();


  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (name === 'password') {
      handleInputChange(event);
      if (!/(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}/.test(value)) {
        handleFormValueChange(name, 'La contraseña no cumple con con los requisitos.'); return;
      }
      else
        handleFormValueChange(name, ""); return;
    };
    if (name === "confirmPassword") {
      setConfirmPassword(value);
      if (formulario.password !== value) {
        handleFormValueChange(name, "Las contraseñas no coinciden.");
        return;
      } else
        handleFormValueChange(name, "");
    }
  }

  const UploadFilePhoto = async () => {
    try {
      if (!filePhoto.file) return;
      await uploadFile(filePhoto.file);

    } catch (error) {
      console.log('error', error)
    }
  }

  const getInitials = (name: string): string => {
    if (!name || name.length === 0) return "U";
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };


  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      setFilePhoto({ url: URL.createObjectURL(file), file });
      setFormulario({ ...formulario, photoName: file.name });
    }
  };

  const handleCancel = () => {
    setFormulario(({ ...formulario, photoName: "" }));
  };

  const handleAddUser = async () => {
    console.log('formulario', formulario);
    await createUser(formulario);
    await UploadFilePhoto();
    navigate("/init/overview/users");
    reset();
  };

  const onClickCancel = () => {
    dispatch(removeUsersActive());
    navigate("/init/overview/users");
    // setIsLoading(true);
    reset();
  };

  const validateSave = () => {
    let errors = Object.values(formControlError);
    let isError = false;
    errors.forEach(value => { if (value !== "") isError = true; });
    return isError;
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        // Validar que los campos requeridos estén completos
        if (!formulario.username || !formulario.email || !formulario.password || !confirmPassword) {
          return false;
        }
        // Validar que no haya errores en los campos
        if (validateSave()) {
          return false;
        }
        return true;
      case 1:
        // Paso de permisos - siempre válido (los permisos son opcionales)
        return true;
      case 2:
        // Paso de revisión - siempre válido
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handlePermissionsChange = (permissions: number[]) => {
    setFormulario({ ...formulario, modulePermissions: permissions });
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
  }

  const handleFinalSubmit = async () => {
    if (!validateSave()) {
      await handleAddUser();
    }
  };

  useEffect(() => {
    getMenuModules();
  }, []);

  useEffect(() => {
    return () => {
      dispatch(removeUsersActive());
    }
  }, [dispatch])

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            {/* Alertas informativas */}
            <Alert severity="info" sx={{ mb: 3 }} icon={<EmailIcon />}>
              <AlertTitle>Estado inicial del usuario</AlertTitle>
              El usuario se creará con estado <strong>Inactivo</strong> hasta que confirme su cuenta mediante el correo electrónico que recibirá.
            </Alert>

            <Alert severity="warning" sx={{ mb: 3 }} icon={<LockIcon />}>
              <AlertTitle>Contraseña temporal</AlertTitle>
              La contraseña que estás configurando es <strong>temporal</strong>. El usuario deberá cambiarla en su primer inicio de sesión.
            </Alert>

            <Grid container spacing={2}>
              <Grid item xs={12} md={7}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Nombre completo"
                      type="text"
                      name="username"
                      value={formulario.username}
                      onChange={handleInputChange}
                      required
                      fullWidth
                      placeholder="Ej: Juan Pérez"
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
                      placeholder='correo@ejemplo.com'
                      required
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Contraseña temporal"
                      type="password"
                      name="password"
                      error={!!formControlError["password"]}
                      helperText={formControlError["password"]}
                      value={formulario.password}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">
                          <Tooltip title={policyPassword}>
                            <InfoIcon />
                          </Tooltip>
                        </InputAdornment>,
                      }}
                      onChange={handlePasswordChange}
                      required
                      fullWidth />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Confirmar contraseña"
                      type="password"
                      name="confirmPassword"
                      error={!!formControlError["confirmPassword"]}
                      helperText={formControlError["confirmPassword"]}
                      value={confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      fullWidth />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Idioma</InputLabel>
                      <Select
                        id="language"
                        name="language"
                        label="Idioma"
                        value={formulario.language}
                        onChange={handleSelectChange}
                      >
                        <MenuItem value="es">Español</MenuItem>
                        <MenuItem value="pt">Portugués</MenuItem>
                        <MenuItem value="en">Inglés</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Rol</InputLabel>
                      <Select
                        id="admin"
                        name="rol"
                        label="Rol"
                        value={formulario.rol}
                        onChange={handleSelectChange}
                      >
                        <MenuItem value={UserRole.USER}>Usuario</MenuItem>
                        <MenuItem value={UserRole.ADMIN}>Administrador</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                  <Avatar
                    src={filePhoto.url || (formulario.photoName ? `${urlImg}${formulario.photoName}` : "")}
                    sx={{
                      width: 100,
                      height: 100,
                      bgcolor: 'secondary.main',
                      fontSize: '2rem',
                      mb: 2
                    }}
                  >
                    {!filePhoto.url && getInitials(formulario?.username || "")}
                  </Avatar>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<PhotoCameraIcon />}
                    size="small"
                  >
                    {t("change_photo")}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleFileUpload}
                    />
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            <ModulePermissionsSelector
              selectedPermissions={formulario.modulePermissions || []}
              onPermissionsChange={handlePermissionsChange}
              menuModules={menuModules}
              isLoading={isLoading}
              disabled={false}
            />
          </Box>
        );

      case 2:
        return (
          <Box>
            <Alert severity="success" sx={{ mb: 3 }} icon={<CheckIcon />}>
              <AlertTitle>Revisión de datos</AlertTitle>
              Por favor, revisa la información antes de crear el usuario.
            </Alert>

            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                Información del Usuario
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Nombre completo</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{formulario.username}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Email</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{formulario.email}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Idioma</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {formulario.language === 'es' ? 'Español' : formulario.language === 'pt' ? 'Portugués' : 'Inglés'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Rol</Typography>
                  <Chip
                    label={formulario.rol === UserRole.ADMIN ? 'Administrador' : 'Usuario'}
                    color={formulario.rol === UserRole.ADMIN ? 'primary' : 'default'}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Estado inicial</Typography>
                  <Chip
                    label="Inactivo (Pendiente confirmación)"
                    color="warning"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Foto de perfil</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {photoName ? 'Configurada' : 'Sin foto'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Permisos asignados</Typography>
                  <Chip
                    label={`${formulario.modulePermissions?.length || 0} módulo${(formulario.modulePermissions?.length || 0) !== 1 ? 's' : ''}`}
                    color={formulario.modulePermissions && formulario.modulePermissions.length > 0 ? 'success' : 'default'}
                    size="small"
                  />
                </Grid>
              </Grid>
            </Paper>

            <Alert severity="info" icon={<InfoIcon />}>
              Al confirmar, se enviará un correo electrónico al usuario con instrucciones para activar su cuenta y cambiar su contraseña temporal.
            </Alert>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Container maxWidth="lg" sx={{
        mt: 4,
        p: { sm: 1, md: 2 },
        mb: 4,
      }}>
        <Loading key="loading-users" loading={isLoading} />

        <Paper elevation={3} sx={{ my: { xs: 3, md: 4 }, p: { xs: 2, md: 4 } }}>
          <AppBar position="static" sx={{ borderRadius: 1 }}>
            <Toolbar>
              <AddCircleIcon fontSize='medium' />
              <Typography variant="h6" component="div" sx={{ flexGrow: 1, ml: 2 }}>
                Crear Nuevo Usuario
              </Typography>
            </Toolbar>
          </AppBar>

          {/* Stepper */}
          <Box sx={{ mt: 4, mb: 4 }}>
            <Stepper activeStep={activeStep}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          <form onSubmit={onSubmit}>
            {/* Contenido del paso actual */}
            <Box sx={{ minHeight: 400, mb: 3 }}>
              {renderStepContent(activeStep)}
            </Box>

            {/* Botones de navegación */}
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={onClickCancel}
                startIcon={<CancelIcon />}
              >
                Cancelar
              </Button>

              <Box sx={{ display: 'flex', gap: 2 }}>
                {activeStep > 0 && (
                  <Button
                    variant="outlined"
                    onClick={handleBack}
                    startIcon={<ArrowBackIcon />}
                  >
                    Atrás
                  </Button>
                )}

                {activeStep < steps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    endIcon={<ArrowForwardIcon />}
                    disabled={!validateStep(activeStep)}
                  >
                    Siguiente
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="success"
                    onClick={handleFinalSubmit}
                    startIcon={<CheckIcon />}
                    disabled={!validateStep(activeStep)}
                  >
                    Crear Usuario
                  </Button>
                )}
              </Box>
            </Box>
          </form>
        </Paper>
      </Container>
    </>
  );
};
