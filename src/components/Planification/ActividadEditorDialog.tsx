import React, { useState } from "react";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import { ActividadEditorBase } from "./ActividadEditorBase";
import { formatISO } from "date-fns";
import {
  IActividadPlanificacion,
  TTipoActividadPlanificada,
} from "../../interfaces/planification";
import { uuidv7 } from "uuidv7";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function ActividadEditorDialog({ campanaId, loteId, cicloId }) {
  const [open, setOpen] = React.useState(false);

  const [actividad, setActividad] = useState<IActividadPlanificacion>({
    accountId: "ffdfs",
    _id: "ciclo:actividad:" + uuidv7(),
    insumosLineasIds: [],
    laboresLineasIds: [],
    fecha: formatISO(new Date()),
    tipo: TTipoActividadPlanificada.COSECHA,
    area: 23.4,
    totalCosto: 2344,
    campanaId: "dddd",
    cicloId: "cicloid",
    campoId: "campoId",
    loteId: "loteId",
    ejecutada: false,
    created: { userId: "dfsdfd", date: "" },
    modified: { userId: "dfsdfd", date: "" },
  });

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const menu_open = Boolean(anchorEl);
  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <React.Fragment>
      <Button variant="outlined" onClick={handleMenuClick}>
        + Actividad
      </Button>

      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={menu_open}
        onClose={handleMenuClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <MenuItem
          onClick={() => {
            handleMenuClose();
            setActividad({
              ...actividad,
              tipo: TTipoActividadPlanificada.SIEMBRA,
            });
            handleClickOpen();
          }}
        >
          Siembra
        </MenuItem>{" "}
        <MenuItem
          onClick={() => {
            handleMenuClose();
            setActividad({
              ...actividad,
              tipo: TTipoActividadPlanificada.APLICACION,
            });
            handleClickOpen();
          }}
        >
          Aplicación
        </MenuItem>{" "}
        <MenuItem
          onClick={() => {
            handleMenuClose();
            setActividad({
              ...actividad,
              tipo: TTipoActividadPlanificada.COSECHA,
            });
            handleClickOpen();
          }}
        >
          Cosecha
        </MenuItem>
      </Menu>

      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>{actividad.tipo}</DialogTitle>
        <DialogContent>
          <ActividadEditorBase
            actividadDoc={actividad}
            onSave={() => {
              console.log("update actividad");
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Disagree</Button>
          <Button onClick={handleClose}>Agree</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
