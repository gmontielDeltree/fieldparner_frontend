import React, { useContext, useState } from "react";

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
import { usePlanActividad } from "../../hooks/usePlanifications";
import { CiclosContext } from "./contexts/CiclosContext";
import { Box, IconButton } from "@mui/material";
import CancelIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const ActividadEditorDialogNoButton = ({
  open,
  handleClose,
  actividad,
  refreshCiclos,
  editing,
}: {
  editing: boolean;
  open: boolean;
  handleClose: () => any;
  actividad: IActividadPlanificacion;
  refreshCiclos: () => any;
}) => {
  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleClose}
      maxWidth={"lg"}
      aria-describedby="alert-dialog-slide-description"
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingX: "1rem",
        }}
      >
        {editing ? (
          <DialogTitle>
            Editando plan de {actividad.tipo.toLocaleUpperCase()}
          </DialogTitle>
        ) : (
          <DialogTitle>
            Nuevo plan de {actividad.tipo.toLocaleUpperCase()}
          </DialogTitle>
        )}
        <IconButton onClick={handleClose}>
          <CancelIcon />
        </IconButton>
      </Box>

      <DialogContent>
        <ActividadEditorBase
          tipo={actividad.tipo}
          actividadDoc={actividad}
          onClose={handleClose}
          onSave={() => {
            refreshCiclos();
            handleClose();
          }}
          editing={editing}
        />
      </DialogContent>
      {/* <DialogActions>
    <Button onClick={handleClose}>Disagree</Button>
    <Button onClick={handleClose}>Agree</Button>
  </DialogActions> */}
    </Dialog>
  );
};

export default function ActividadEditorDialog({
  campanaId,
  loteId,
  cicloId,
  campoId,
}) {
  const [open, setOpen] = React.useState(false);

  const { refreshCiclos } = useContext(CiclosContext); // useCiclos(ciclo.campanaId,loteId)

  let cleanAct = {
    accountId: "ffdfs",
    _id: "planactividad:" + uuidv7(),
    insumosLineasIds: [],
    laboresLineasIds: [],
    fecha: formatISO(new Date()),
    tipo: TTipoActividadPlanificada.COSECHA,
    area: 23.4,
    totalCosto: 2344,
    campanaId: campanaId,
    cicloId: cicloId,
    campoId: campoId,
    loteId: loteId,
    ejecutada: false,
    created: { userId: "dfsdfd", date: "" },
    modified: { userId: "dfsdfd", date: "" },
  };

  const [actividad, setActividad] = useState<IActividadPlanificacion>({
    ...cleanAct,
  });

  const { saveActividad } = usePlanActividad();

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

  const {t} = useTranslation();

  return (
    <React.Fragment>
      <Button variant={"contained"} color={"success"} onClick={handleMenuClick}>
        + {t("Actividad")}
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
              ...cleanAct,
              tipo: TTipoActividadPlanificada.PREPARADO,
            });
            handleClickOpen();
          }}
        >
          {t("Preparación")}
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleMenuClose();
            setActividad({
              ...cleanAct,
              tipo: TTipoActividadPlanificada.SIEMBRA,
            });
            handleClickOpen();
          }}
        >
          {t("Siembra")}
        </MenuItem>{" "}
        <MenuItem
          onClick={() => {
            handleMenuClose();
            setActividad({
              ...cleanAct,
              tipo: TTipoActividadPlanificada.APLICACION,
            });
            handleClickOpen();
          }}
        >
          {t("Aplicación")}
        </MenuItem>{" "}
        <MenuItem
          onClick={() => {
            handleMenuClose();
            setActividad({
              ...cleanAct,
              tipo: TTipoActividadPlanificada.COSECHA,
            });
            handleClickOpen();
          }}
        >
          {t("Cosecha")}
        </MenuItem>
      </Menu>

      <ActividadEditorDialogNoButton
        {...{ open, handleClose, actividad, refreshCiclos, editing: false }}
      />
    </React.Fragment>
  );
}
