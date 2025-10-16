import React, { useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  Container,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { useAuthStore, useForm } from '../hooks';
import { useNavigate } from 'react-router-dom';
import { Loading } from '../components';

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#._])[A-Za-z\d@$!%*?&#._]{8,}$/;

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Referencias para los inputs de código
  const cod1Ref = useRef<HTMLInputElement>(null);
  const cod2Ref = useRef<HTMLInputElement>(null);
  const cod3Ref = useRef<HTMLInputElement>(null);
  const cod4Ref = useRef<HTMLInputElement>(null);
  const cod5Ref = useRef<HTMLInputElement>(null);
  const cod6Ref = useRef<HTMLInputElement>(null);

  const {
    email,
    cod1,
    cod2,
    cod3,
    cod4,
    cod5,
    cod6,
    newPassword,
    confirmPassword,
    error,
    handleInputChange,
    setFormulario,
  } = useForm({
    email: '',
    cod1: '',
    cod2: '',
    cod3: '',
    cod4: '',
    cod5: '',
    cod6: '',
    newPassword: '',
    confirmPassword: '',
    error: {
      email: '',
      code: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const { isLoading, errorMessage, startForgotPassword, startConfirmForgotPassword } =
    useAuthStore();

  // Manejo de auto-focus entre inputs de código
  const handleCodeInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    nextRef: React.RefObject<HTMLInputElement> | null
  ) => {
    handleInputChange(e);
    if (e.target.value.length === 1 && nextRef?.current) {
      nextRef.current.focus();
    }
  };

  const handleSendCode = () => {
    if (!email) {
      setFormulario((prevState) => ({
        ...prevState,
        error: {
          ...prevState.error,
          email: 'Ingrese su email.',
        },
      }));
      return;
    }

    setFormulario((prevState) => ({
      ...prevState,
      error: {
        ...prevState.error,
        email: '',
      },
    }));

    startForgotPassword(email, () => {
      setStep(2);
    });
  };

  const handleVerifyCode = () => {
    const code = cod1 + cod2 + cod3 + cod4 + cod5 + cod6;
    if (code.length !== 6) {
      setFormulario((prevState) => ({
        ...prevState,
        error: {
          ...prevState.error,
          code: 'Ingrese el código de 6 dígitos.',
        },
      }));
      return;
    }

    setFormulario((prevState) => ({
      ...prevState,
      error: {
        ...prevState.error,
        code: '',
      },
    }));

    setStep(3);
  };

  const handleResetPassword = () => {
    if (!newPassword || !confirmPassword) {
      setFormulario((prevState) => ({
        ...prevState,
        error: {
          ...prevState.error,
          newPassword: !newPassword ? 'Ingrese su nueva contraseña.' : '',
          confirmPassword: !confirmPassword ? 'Confirme su contraseña.' : '',
        },
      }));
      return;
    }

    // Validar política de contraseña
    if (!PASSWORD_REGEX.test(newPassword)) {
      setFormulario((prevState) => ({
        ...prevState,
        error: {
          ...prevState.error,
          newPassword:
            'La contraseña debe contener al menos una mayúscula, un dígito, un carácter especial y 8 caracteres.',
        },
      }));
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormulario((prevState) => ({
        ...prevState,
        error: {
          ...prevState.error,
          confirmPassword: 'Las contraseñas no coinciden.',
        },
      }));
      return;
    }

    setFormulario((prevState) => ({
      ...prevState,
      error: {
        ...prevState.error,
        newPassword: '',
        confirmPassword: '',
      },
    }));

    const confirmationCode = cod1 + cod2 + cod3 + cod4 + cod5 + cod6;
    startConfirmForgotPassword(email, confirmationCode, newPassword, (success: boolean) => {
      if (success) {
        setSuccessMessage('Contraseña cambiada exitosamente. Redirigiendo al login...');
        setTimeout(() => {
          navigate('/init/auth/login');
        }, 2000);
      }
    });
  };

  const handleCancel = () => {
    navigate('/init/auth/login');
  };

  return (
    <Container maxWidth="xs">
      {isLoading && <Loading key="loading-auth" loading={true} />}
      <Box
        sx={{
          my: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginTop: { sm: 15 },
        }}
      >
        <Box display="flex" sx={{ margin: 'auto', mb: 5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              backgroundImage: 'url(/assets/images/logos/agrootolss_logo_sol.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
          <Typography component="h4" variant="h4" ml={1}>
            FieldPartner
          </Typography>
        </Box>

        {/* PASO 1: Ingresar Email */}
        {step === 1 && (
          <>
            <Typography component="h1" variant="h5" mb={2}>
              Recuperar Contraseña
            </Typography>
            <Typography
              component="p"
              variant="body2"
              color="GrayText"
              textAlign="center"
              mb={3}
            >
              Ingresa tu email y te enviaremos un código de verificación.
            </Typography>
            <Box sx={{ mt: 1, width: '100%' }}>
              <TextField
                margin="normal"
                type="email"
                placeholder="correo@gmail.com"
                required
                fullWidth
                error={!!error['email']}
                helperText={error['email'] || ''}
                id="email"
                label="Email"
                onChange={handleInputChange}
                value={email}
                name="email"
                autoComplete="email"
                autoFocus
              />
              {errorMessage && (
                <Alert severity="error" sx={{ my: 1 }}>
                  {errorMessage}
                </Alert>
              )}
              <Button
                type="button"
                fullWidth
                variant="contained"
                onClick={handleSendCode}
                sx={{ mt: 3, mb: 2 }}
              >
                ENVIAR CÓDIGO
              </Button>
              <Button
                type="button"
                fullWidth
                variant="outlined"
                onClick={handleCancel}
                sx={{ mb: 2 }}
              >
                Cancelar
              </Button>
            </Box>
          </>
        )}

        {/* PASO 2: Ingresar Código */}
        {step === 2 && (
          <>
            <Typography component="h1" variant="h5" mb={2}>
              Revisa tu correo
            </Typography>
            <Typography
              component="p"
              variant="body2"
              color="GrayText"
              textAlign="center"
              mb={3}
            >
              Hemos enviado un código de verificación a {email}
            </Typography>
            <ButtonGroup variant="outlined" aria-label="outlined button group">
              <TextField
                sx={{ maxWidth: '40px' }}
                color="primary"
                type="text"
                inputProps={{ maxLength: 1 }}
                inputRef={cod1Ref}
                name="cod1"
                value={cod1}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleCodeInputChange(e, cod2Ref)
                }
                autoComplete="off"
                autoFocus
              />
              <TextField
                sx={{ maxWidth: '40px', mx: 1 }}
                color="primary"
                type="text"
                inputProps={{ maxLength: 1 }}
                inputRef={cod2Ref}
                name="cod2"
                value={cod2}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleCodeInputChange(e, cod3Ref)
                }
                autoComplete="off"
              />
              <TextField
                sx={{ maxWidth: '40px' }}
                color="primary"
                type="text"
                inputProps={{ maxLength: 1 }}
                inputRef={cod3Ref}
                name="cod3"
                value={cod3}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleCodeInputChange(e, cod4Ref)
                }
                autoComplete="off"
              />
              <TextField
                sx={{ maxWidth: '40px', mx: 1 }}
                color="primary"
                type="text"
                inputProps={{ maxLength: 1 }}
                inputRef={cod4Ref}
                name="cod4"
                value={cod4}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleCodeInputChange(e, cod5Ref)
                }
                autoComplete="off"
              />
              <TextField
                sx={{ maxWidth: '40px' }}
                color="primary"
                type="text"
                inputProps={{ maxLength: 1 }}
                inputRef={cod5Ref}
                name="cod5"
                value={cod5}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleCodeInputChange(e, cod6Ref)
                }
                autoComplete="off"
              />
              <TextField
                sx={{ maxWidth: '40px', mx: 1 }}
                color="primary"
                type="text"
                inputProps={{ maxLength: 1 }}
                inputRef={cod6Ref}
                name="cod6"
                value={cod6}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleCodeInputChange(e, null)
                }
                autoComplete="off"
              />
            </ButtonGroup>
            {error['code'] && (
              <Alert severity="error" sx={{ my: 2 }}>
                {error['code']}
              </Alert>
            )}
            {errorMessage && (
              <Alert severity="error" sx={{ my: 2 }}>
                {errorMessage}
              </Alert>
            )}
            <Button
              type="button"
              fullWidth
              variant="contained"
              onClick={handleVerifyCode}
              sx={{ mt: 5, mb: 2 }}
            >
              CONTINUAR
            </Button>
            <Button
              type="button"
              fullWidth
              variant="outlined"
              onClick={handleCancel}
              sx={{ mb: 2 }}
            >
              Cancelar
            </Button>
          </>
        )}

        {/* PASO 3: Nueva Contraseña */}
        {step === 3 && (
          <>
            <Typography component="h1" variant="h5" mb={2}>
              Nueva Contraseña
            </Typography>
            <Typography
              component="p"
              variant="body2"
              color="GrayText"
              textAlign="center"
              mb={3}
            >
              Ingresa tu nueva contraseña.
            </Typography>
            <Box sx={{ mt: 1, width: '100%' }}>
              <Tooltip
                title={
                  <Box sx={{ p: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Requisitos de la contraseña:
                    </Typography>
                    <Box component="ul" sx={{ pl: 2, m: 0 }}>
                      <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                        Al menos 8 caracteres
                      </Typography>
                      <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                        Una letra mayúscula (A-Z)
                      </Typography>
                      <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                        Un número (0-9)
                      </Typography>
                      <Typography component="li" variant="body2">
                        Un carácter especial (@$!%*?&#._)
                      </Typography>
                    </Box>
                  </Box>
                }
                arrow
                placement="top"
                componentsProps={{
                  tooltip: {
                    sx: {
                      bgcolor: 'grey.900',
                      fontSize: '0.875rem',
                      maxWidth: 320,
                      p: 0,
                    },
                  },
                  arrow: {
                    sx: {
                      color: 'grey.900',
                    },
                  },
                }}
              >
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="newPassword"
                  label="Nueva Contraseña"
                  error={!!error['newPassword']}
                  helperText={error['newPassword'] || ''}
                  onChange={handleInputChange}
                  value={newPassword}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nueva contraseña"
                  id="newPassword"
                  autoFocus
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Tooltip>
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirmar Contraseña"
                error={!!error['confirmPassword']}
                helperText={error['confirmPassword'] || ''}
                onChange={handleInputChange}
                value={confirmPassword}
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirmar contraseña"
                id="confirmPassword"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {successMessage && (
                <Alert severity="success" sx={{ my: 1 }}>
                  {successMessage}
                </Alert>
              )}
              {errorMessage && (
                <Alert severity="error" sx={{ my: 1 }}>
                  {errorMessage}
                </Alert>
              )}
              <Button
                type="button"
                fullWidth
                variant="contained"
                onClick={handleResetPassword}
                sx={{ mt: 3, mb: 2 }}
              >
                CAMBIAR CONTRASEÑA
              </Button>
              <Button
                type="button"
                fullWidth
                variant="outlined"
                onClick={handleCancel}
                sx={{ mb: 2 }}
              >
                Cancelar
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Container>
  );
};
