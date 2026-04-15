import React from "react";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { MoreVert } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

export const PlanificacionMoreButton = ({ onReportePorCultivoXLS, onReportePorCultivoPDF }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const {t} = useTranslation()

  return (
    <>
      <IconButton
        aria-label="more"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      >
        <MoreVert />
      </IconButton>

      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <MenuItem
          onClick={() => {
            handleClose();
            onReportePorCultivoXLS();
          }}
        >
          {t("Reporte por Cultivo XLS")}
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleClose();
            onReportePorCultivoPDF();
          }}
        >
            {t("Reporte por Cultivo PDF")}

        </MenuItem>
      </Menu>
    </>
  );
};
