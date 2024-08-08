import React, { useEffect, useState } from "react";
// import CssBaseline from '@mui/material/CssBaseline';
import Typography from "@mui/material/Typography";
import { useForm, useAuthStore, useAppDispatch } from "../hooks";
import {
  Button,
  TextField,
  Link,
  Box,
  IconButton,
  InputAdornment,
  Container,
  Alert,
  Grid,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
import { clearErrorMessage } from "../redux/auth";
import { Loading } from "../components";
import { NavLink } from "react-router-dom";

function Copyright(props: any) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link color="inherit" href="https://www.qtsagro.net/">
        QTS Agro
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

// TODO remove, this demo shouldn't need to reset the theme.
// TODO refactor Copyright.

export const LoginPage = () => {
  const dispatch = useAppDispatch();

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const { errorMessage, isLoading, startLogin } = useAuthStore();
  const { email, password, error, setFormulario, handleInputChange } = useForm({
    email: "",
    password: "",
    error: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (email === "" || password === "") {
      setFormulario((prevState) => ({
        ...prevState,
        error: {
          email: !email ? "Ingrese su email." : "",
          password: !password ? "Ingrese su contraseña " : "",
        },
      }));
      return;
    }
    startLogin({ email, password });
  };

  useEffect(() => {
    return () => {
      dispatch(clearErrorMessage());
    };
  }, [dispatch]);

  return (
    <Container maxWidth="xs">
      {isLoading && <Loading key="loading-auth" loading={true} />}
      <Box
        sx={{
          my: 10,
          // mx: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: { sm: 15 },
        }}
      >
        <Box display="flex" sx={{ margin: "auto", mb: 5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              backgroundImage:
                "url(/assets/images/logos/agrootolss_logo_sol.png)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />
          <Typography component="h4" variant="h4" ml={1}>
            FieldPartner
          </Typography>
        </Box>

        <Typography component="h1" variant="h5">
          Iniciar Sesión
        </Typography>
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            type="email"
            placeholder='correo@gmail.com'
            required
            fullWidth
            error={!!error["email"]}
            helperText={error["email"] || ""}
            id="email"
            label="Email"
            onChange={handleInputChange}
            value={email}
            name="email"
            autoComplete="email"
            autoFocus
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Contraseña"
            error={!!error["password"]}
            helperText={error["password"] || ""}
            onChange={handleInputChange}
            value={password}
            type={showPassword ? "text" : "password"}
            placeholder='Contraseña'
            id="password"
            autoComplete="current-password"
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
          {/* <FormControlLabel
                        control={<Checkbox value="remember" color="primary" />}
                        label="Remember me"
                    /> */}
          {errorMessage && (
            <Alert severity="error" sx={{ my: 1 }}>
              {errorMessage}
            </Alert>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            INGRESAR
          </Button>
          <Grid container>
                        <Grid item xs>
                            <Link href="#" variant="body2">
                                Forgot password?
                            </Link>
                        </Grid>
                        <Grid item>
                            <Link component={NavLink} to="/init/auth/register" variant="body2">
                                {"Don't have an account? Sign Up"}
                            </Link>
                        </Grid>
                    </Grid>
          <Copyright sx={{ mt: 5 }} />
        </Box>
      </Box>
    </Container>
  );
};
