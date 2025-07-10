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
import { Box, IconButton, Card, CardContent, Typography, Avatar, ButtonBase, Tooltip } from "@mui/material";
import CancelIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";
import AddIcon from "@mui/icons-material/Add";

// Import activity icons
import preparadoIcon from '../../images/icons/calendar.png';
import categoryIcon1 from '../../images/icons/sowing.png';
import categoryIcon2 from '../../images/icons/application.png';
import categoryIcon3 from '../../images/icons/harvest.png';

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

  const { t } = useTranslation();

  // Activity types with their respective icons
  const activityTypes = [
    {
      type: TTipoActividadPlanificada.PREPARADO,
      label: t("preparation"),
      icon: preparadoIcon,
      color: "#6b7280",
      description: t("prepareTheSoilForCultivation")
    },
    {
      type: TTipoActividadPlanificada.SIEMBRA,
      label: t("sowing"),
      icon: categoryIcon1,
      color: "#10b981",
      description: t("plantSeedsOrSeedlings")
    },
    {
      type: TTipoActividadPlanificada.APLICACION,
      label: t("application"),
      icon: categoryIcon2,
      color: "#3b82f6",
      description: t("applyFertilizersOrTreatments")
    },
    {
      type: TTipoActividadPlanificada.COSECHA,
      label: t("harvesting"),
      icon: categoryIcon3,
      color: "#f59e0b",
      description: t("harvestTheCrops")
    }
  ];

  const [showActivitySelection, setShowActivitySelection] = useState(false);

  const handleActivitySelect = (activityType: TTipoActividadPlanificada) => {
    setActividad({
      ...cleanAct,
      tipo: activityType,
    });
    setShowActivitySelection(false);
    handleClickOpen();
  };

  return (
    <React.Fragment>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setShowActivitySelection(true)}
        startIcon={<AddIcon />}
        sx={{
          borderRadius: "8px",
          textTransform: "none",
          fontWeight: 600,
          px: 3
        }}
      >
        {t("newActivity")}
      </Button>

      {/* Activity Selection Dialog */}
      <Dialog
        open={showActivitySelection}
        onClose={() => setShowActivitySelection(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: "16px" }
        }}
      >
        <DialogTitle sx={{
          textAlign: "center",
          pb: 4, // Increased padding bottom from 3 to 4
          pt: 4, // Increased padding top from 3 to 4
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          borderRadius: "16px 16px 0 0"
        }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            🌾 {t("selectActivityType")}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {t("chooseTheActivityTypeYouWantToPlan")}
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ p: 3, pt: 6, pb: 4 }}> {/* Increased padding top to 6 and bottom to 4 */}
          <Box sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 3, // Increased gap from 2 to 3
            mt: 2 // Added margin top
          }}>
            {activityTypes.map((activity) => (
              <Card
                key={activity.type}
                sx={{
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  border: "2px solid transparent",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    borderColor: activity.color,
                  }
                }}
                onClick={() => handleActivitySelect(activity.type)}
              >
                <CardContent sx={{
                  textAlign: "center",
                  p: 3,
                  "&:last-child": { pb: 3 }
                }}>
                  <Avatar
                    src={activity.icon}
                    sx={{
                      width: 80,
                      height: 80,
                      margin: "0 auto 16px auto",
                      backgroundColor: `${activity.color}15`,
                      border: `2px solid ${activity.color}30`
                    }}
                    imgProps={{
                      style: {
                        objectFit: 'contain',
                        padding: '10px',
                      },
                    }}
                  />
                  <Typography variant="h6" sx={{
                    fontWeight: 600,
                    color: activity.color,
                    mb: 1
                  }}>
                    {activity.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.875rem" }}>
                    {activity.description}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setShowActivitySelection(false)} color="inherit">
            {t("cancel")}
          </Button>
        </DialogActions>
      </Dialog>

      <ActividadEditorDialogNoButton
        {...{ open, handleClose, actividad, refreshCiclos, editing: false }}
      />
    </React.Fragment>
  );
}
