import React, { useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import { useForm, useAuthStore, useAppDispatch } from "../hooks";
import {
  Button,
  TextField,
  Link,
  Box,
  IconButton,
  InputAdornment,
  Alert,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
import { clearErrorMessage } from "../redux/auth";
import { Loading } from "../components";
import { NavLink } from "react-router-dom";

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

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
      bgcolor: "rgba(255,255,255,0.06)",
      color: "#fff",
      transition: "all 0.2s",
      "& fieldset": {
        borderColor: "rgba(255,255,255,0.2)",
      },
      "&:hover fieldset": {
        borderColor: "rgba(255,255,255,0.4)",
      },
      "&.Mui-focused fieldset": {
        borderColor: "rgba(255,255,255,0.6)",
      },
      "&.Mui-focused": {
        boxShadow: "0 0 0 3px rgba(255,255,255,0.1)",
      },
    },
    "& .MuiInputBase-input::placeholder": {
      color: "rgba(255,255,255,0.45)",
      opacity: 1,
    },
    "& .MuiFormHelperText-root": {
      color: "#ff8a80",
    },
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {isLoading && <Loading key="loading-auth" loading={true} />}

      {/* Logo */}
      <Box
        sx={{
          width: 64,
          height: 64,
          mb: 1.5,
          backgroundImage: "url(/assets/images/logos/agrootolss_logo_sol.png)",
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))",
        }}
      />

      {/* Brand name */}
      <Typography
        sx={{
          fontSize: "1.75rem",
          fontWeight: 700,
          color: "#fff",
          letterSpacing: "-0.01em",
          mb: 3,
          textShadow: "0 2px 8px rgba(0,0,0,0.3)",
        }}
      >
        FieldPartner
      </Typography>

      {/* Card */}
      <Box
        sx={{
          width: "100%",
          bgcolor: "rgba(25, 100, 180, 0.45)",
          backdropFilter: "blur(20px)",
          borderRadius: "16px",
          border: "1px solid rgba(255,255,255,0.1)",
          px: { xs: 3, sm: 4 },
          py: 4,
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        }}
      >
        {/* Heading */}
        <Box sx={{ mb: 3, textAlign: "center" }}>
          <Typography
            sx={{
              fontSize: "1.35rem",
              fontWeight: 600,
              color: "#fff",
              mb: 0.5,
            }}
          >
            Iniciar sesión
          </Typography>
          <Typography
            sx={{
              fontSize: "0.875rem",
              color: "rgba(255,255,255,0.55)",
            }}
          >
            Ingresá tus credenciales para continuar
          </Typography>
        </Box>

        {/* Form */}
        <Box component="form" noValidate onSubmit={handleSubmit}>
          <Box sx={{ mb: 2 }}>
            <Typography
              component="label"
              htmlFor="email"
              sx={{
                display: "block",
                fontSize: "0.8rem",
                fontWeight: 500,
                color: "rgba(255,255,255,0.7)",
                mb: 0.75,
              }}
            >
              Email
            </Typography>
            <TextField
              type="email"
              placeholder="correo@ejemplo.com"
              required
              fullWidth
              size="small"
              error={!!error["email"]}
              helperText={error["email"] || ""}
              id="email"
              onChange={handleInputChange}
              value={email}
              name="email"
              autoComplete="email"
              autoFocus
              sx={inputSx}
            />
          </Box>

          <Box sx={{ mb: 1 }}>
            <Typography
              component="label"
              htmlFor="password"
              sx={{
                display: "block",
                fontSize: "0.8rem",
                fontWeight: 500,
                color: "rgba(255,255,255,0.7)",
                mb: 0.75,
              }}
            >
              Contraseña
            </Typography>
            <TextField
              required
              fullWidth
              size="small"
              name="password"
              error={!!error["password"]}
              helperText={error["password"] || ""}
              onChange={handleInputChange}
              value={password}
              type={showPassword ? "text" : "password"}
              placeholder="Ingresá tu contraseña"
              id="password"
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                      sx={{ color: "rgba(255,255,255,0.45)" }}
                    >
                      {showPassword ? (
                        <VisibilityOffIcon fontSize="small" />
                      ) : (
                        <VisibilityIcon fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={inputSx}
            />
          </Box>

          {/* Forgot password */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
            <Link
              component={NavLink}
              to="/init/auth/forgot-password"
              underline="hover"
              sx={{
                fontSize: "0.8rem",
                fontWeight: 500,
                color: "rgba(255,255,255,0.55)",
                "&:hover": { color: "#fff" },
              }}
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </Box>

          {/* Error */}
          {errorMessage && errorMessage !== "" && (
            <Alert
              severity="error"
              sx={{
                mb: 2.5,
                borderRadius: "10px",
                fontSize: "0.85rem",
              }}
            >
              {errorMessage}
            </Alert>
          )}

          {/* Submit */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disableElevation
            sx={{
              py: 1.3,
              borderRadius: "10px",
              textTransform: "none",
              fontSize: "0.95rem",
              fontWeight: 600,
              bgcolor: "#fff",
              color: "#0f172a",
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.9)",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 16px rgba(255,255,255,0.2)",
              },
              "&:active": {
                transform: "translateY(0)",
              },
              transition: "all 0.2s",
            }}
          >
            Ingresar
          </Button>
        </Box>
      </Box>

      {/* Copyright */}
      <Typography
        sx={{
          mt: 3,
          fontSize: "0.78rem",
          color: "rgba(255,255,255,0.45)",
          textShadow: "0 1px 4px rgba(0,0,0,0.3)",
        }}
      >
        {"© "}
        <Link
          href="https://www.qtsagro.net/"
          underline="hover"
          sx={{ color: "rgba(255,255,255,0.45)", "&:hover": { color: "#fff" } }}
        >
          QTS Agro
        </Link>{" "}
        {new Date().getFullYear()}
      </Typography>
    </Box>
  );
};
