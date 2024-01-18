import {
  AppBar,
  Grid,
  IconButton,
  Toolbar,
  Typography,
  Avatar,
  ButtonBase,
  Button,
  Menu,
  MenuItem,
} from "@mui/material";
import React, { useState } from "react";
import { NavBarProps } from "../../types";
import iconoCampo from "../../images/icons/iconodecampo2D.webp";
import integrationsIcon from "../../images/icons/integrations.png";
import deposito from "../../images/icons/deposito_2.webp";
import insumos from "../../images/icons/icono de insumos.webp";
import spanishFlagIcon from "../../images/icons/spain_flag.png";
import englishFlagIcon from "../../images/icons/usa_flag.png";
import brazilFlagIcon from "../../images/icons/brazil_flag.png";
import { useAuthStore } from "../../hooks";

import {
  Notifications,
  NotificationsActive,
  MenuOutlined,
  ExitToApp,
} from "@mui/icons-material";
import { Badge, Tooltip } from "@mui/material";
import { useNavigate } from "react-router-dom";

export const NavBar: React.FC<NavBarProps> = ({
  drawerWidth = 240,
  open,
  handleSideBarOpen,
}) => {
  const navigate = useNavigate();
  const navigateTo = (path: string) => {
    window.location.replace(path);
  };

  const [hasNotifications, setHasNotifications] = useState(true);
  const [notificationCount, setNotificationCount] = useState(3);
  const [language, setLanguage] = useState("spanish");
  const { startLogout } = useAuthStore();

  const [languageAnchorEl, setLanguageAnchorEl] = React.useState(null);
  const isLanguageMenuOpen = Boolean(languageAnchorEl);

  const handleLanguageMenu = (event) => {
    setLanguageAnchorEl(event.currentTarget);
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    setLanguageAnchorEl(null);
  };

  const handleLanguageMenuClose = () => {
    setLanguageAnchorEl(null);
  };

  const handleNotificationClick = () => {
    setHasNotifications(!hasNotifications);
    setNotificationCount(hasNotifications ? 0 : 3);
  };

  const pulseAnimation = {
    animation: "pulse 2s infinite",
    "@keyframes pulse": {
      "0%": {
        boxShadow: "0 0 0 0 rgba(0, 123, 255, 0.7)",
      },
      "70%": {
        boxShadow: "0 0 0 10px rgba(0, 123, 255, 0)",
      },
      "100%": {
        boxShadow: "0 0 0 0 rgba(0, 123, 255, 0)",
      },
    },
  };
  const [anchorEl, setAnchorEl] = React.useState(null);
  const openDropdown = Boolean(anchorEl);
  const handleLogout = () => {
    console.log("Logout clicked");
    startLogout();
  };
  // 3. Handler functions for dropdown menu
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);

  const selectAvatar = (avatar: string) => {
    setSelectedAvatar(avatar);
  };
  const avatarStyle = (avatar: string) => ({
    width: 30,
    height: 30,
    transition:
      "transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
    transform: selectedAvatar === avatar ? "scale(1.2)" : "scale(1)",
    boxShadow:
      selectedAvatar === avatar ? "0 3px 10px 0 rgba(0,0,0,0.2)" : "none",
    border: "2px solid",
    borderColor: selectedAvatar === avatar ? "#1976d2" : "transparent",
    borderRadius: "50%",
    backgroundColor:
      selectedAvatar === avatar ? "rgba(25, 118, 210, 0.1)" : "transparent",
  });

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: "white",
        color: "black",
        ...(open && {
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }),
      }}
    >
      <Toolbar>
        <IconButton
          color="default"
          edge="start"
          onClick={handleSideBarOpen}
          sx={{ mr: 2, ...(open && { display: "none" }) }}
        >
          <MenuOutlined />
        </IconButton>

        <Grid
          container
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          wrap="nowrap"
        >
          <Grid item sx={{ display: "flex", alignItems: "center" }}>
            <Typography
              onClick={() => navigate("/init/overview/fields")}
              variant="h6"
              noWrap
              component="div"
              sx={{
                color: "black",
                fontWeight: "bold",
                whiteSpace: "nowrap",
                marginRight: "40px",
              }}
            >
              FieldPartner
            </Typography>
            <ButtonBase
              onClick={() => selectAvatar("avatar1")}
              sx={{ borderRadius: "50%", marginRight: "18px" }}
            >
              <Avatar
                alt="Campo"
                src={iconoCampo}
                sx={avatarStyle("avatar1")}
              />
            </ButtonBase>
            <ButtonBase
              onClick={() => navigate("/init/overview/fields/integrations")}
              sx={{ borderRadius: "50%", marginRight: "18px" }}
            >
              <Avatar
                alt="Integrations"
                src={integrationsIcon}
                sx={avatarStyle("avatar2")}
              />
            </ButtonBase>
            {/* <ButtonBase
              onClick={() => selectAvatar("avatar2")}
              sx={{ borderRadius: "50%", marginRight: "18px" }}
            >
              <Avatar
                alt="Deposito"
                src={deposito}
                sx={avatarStyle("avatar2")}
              />
            </ButtonBase>
            <ButtonBase
              onClick={() => selectAvatar("avatar3")}
              sx={{ borderRadius: "50%", marginRight: "25px" }}
            >
              <Avatar alt="Insumos" src={insumos} sx={avatarStyle("avatar3")} />
            </ButtonBase> */}

            <Tooltip title="Notifications" enterDelay={500} leaveDelay={200}>
              <IconButton
                color={hasNotifications ? "secondary" : "default"}
                onClick={handleNotificationClick}
                sx={{ ml: 2, ...(hasNotifications ? pulseAnimation : {}) }}
              >
                <Badge badgeContent={notificationCount} color="error">
                  {hasNotifications ? (
                    <NotificationsActive />
                  ) : (
                    <Notifications />
                  )}
                </Badge>
              </IconButton>
            </Tooltip>
            <Button
              aria-label="campaign"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
              style={{
                marginLeft: "50px",
                backgroundColor: "#f5f5f5",
                color: "#1976d2",
                borderRadius: "4px",
                textTransform: "none",
              }}
            >
              Sin campaña
            </Button>

            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={openDropdown}
              onClose={handleClose}
            >
              <MenuItem onClick={handleClose}> + Nueva Campaña</MenuItem>
            </Menu>
          </Grid>
          <Grid item>
            <IconButton
              color="inherit"
              aria-label="change-language"
              onClick={handleLanguageMenu}
            >
              <img
                src={
                  language === "spanish"
                    ? spanishFlagIcon
                    : language === "english"
                    ? englishFlagIcon
                    : brazilFlagIcon
                }
                alt={language}
                style={{ width: "24px", height: "24px" }}
              />
            </IconButton>

            {/* Language Menu */}
            <Menu
              anchorEl={languageAnchorEl}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={isLanguageMenuOpen}
              onClose={handleLanguageMenuClose}
            >
              <MenuItem onClick={() => handleLanguageChange("spanish")}>
                <img
                  src={spanishFlagIcon}
                  alt="Spanish"
                  style={{ width: "24px", height: "24px" }}
                />
              </MenuItem>
              <MenuItem onClick={() => handleLanguageChange("english")}>
                <img
                  src={englishFlagIcon}
                  alt="English"
                  style={{ width: "24px", height: "24px" }}
                />
              </MenuItem>
              <MenuItem onClick={() => handleLanguageChange("brazilian")}>
                <img
                  src={brazilFlagIcon}
                  alt="Brazilian"
                  style={{ width: "24px", height: "24px" }}
                />
              </MenuItem>
            </Menu>

            <IconButton
              edge="end"
              color="inherit"
              aria-label="logout"
              onClick={handleLogout}
            >
              <ExitToApp />
            </IconButton>
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );
};
