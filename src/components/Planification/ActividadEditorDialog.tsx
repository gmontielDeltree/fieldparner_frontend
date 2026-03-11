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
import { CultivoContext } from "./contexts/CultivosContext";
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
  ciclo,
}: {
  editing: boolean;
  open: boolean;
  handleClose: () => any;
  actividad: IActividadPlanificacion;
  refreshCiclos: () => any;
  ciclo?: any;
}) => {
  const { t } = useTranslation();

  // Map activity type to translated label
  const getActivityLabel = (tipo: string) => {
    const normalizedType = tipo?.toLowerCase();
    switch (normalizedType) {
      case 'preparado':
      case 'preparation':
        return t('preparation');
      case 'siembra':
      case 'sowing':
        return t('sowing');
      case 'aplicacion':
      case 'application':
        return t('application');
      case 'cosecha':
      case 'harvesting':
        return t('harvesting');
      default:
        return tipo;
    }
  };

  // Get activity icon and color
  const getActivityStyle = (tipo: string) => {
    const normalizedType = tipo?.toLowerCase();
    switch (normalizedType) {
      case 'preparado':
      case 'preparation':
        return { icon: preparadoIcon, color: '#6b7280', emoji: '🔧' };
      case 'siembra':
      case 'sowing':
        return { icon: categoryIcon1, color: '#10b981', emoji: '🌱' };
      case 'aplicacion':
      case 'application':
        return { icon: categoryIcon2, color: '#3b82f6', emoji: '💧' };
      case 'cosecha':
      case 'harvesting':
        return { icon: categoryIcon3, color: '#f59e0b', emoji: '🌾' };
      default:
        return { icon: null, color: '#6b7280', emoji: '📋' };
    }
  };

  const activityStyle = getActivityStyle(actividad.tipo);
  const activityLabel = getActivityLabel(actividad.tipo);

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleClose}
      maxWidth={"lg"}
      fullWidth
      aria-describedby="alert-dialog-slide-description"
      PaperProps={{
        sx: {
          borderRadius: "16px",
          overflow: "hidden",
        }
      }}
    >
      {/* Modern Header with Gradient */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${activityStyle.color} 0%, ${activityStyle.color}dd 100%)`,
          color: "white",
          padding: "24px 32px",
          position: "relative",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {activityStyle.icon && (
            <Avatar
              src={activityStyle.icon}
              sx={{
                width: 56,
                height: 56,
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                border: "2px solid rgba(255, 255, 255, 0.3)",
                backdropFilter: "blur(10px)",
              }}
              imgProps={{
                style: {
                  objectFit: 'contain',
                  padding: '8px',
                },
              }}
            />
          )}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              {editing ? t('editActivity') : t('newActivity')}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.95, fontWeight: 500 }}>
              {activityStyle.emoji} {activityLabel}
            </Typography>
          </Box>
          <Tooltip title={t('close')}>
            <IconButton
              onClick={handleClose}
              sx={{
                color: "white",
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.25)",
                },
              }}
            >
              <CancelIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <DialogContent sx={{ p: 0 }}>
        <ActividadEditorBase
          tipo={actividad.tipo}
          actividadDoc={actividad}
          onClose={handleClose}
          onSave={() => {
            refreshCiclos();
            handleClose();
          }}
          editing={editing}
          ciclo={ciclo}
        />
      </DialogContent>
    </Dialog>
  );
};

export default function ActividadEditorDialog({
  campanaId,
  loteId,
  cicloId,
  campoId,
  ciclo,
}) {
  const [open, setOpen] = React.useState(false);

  const { refreshCiclos } = useContext(CiclosContext); // useCiclos(ciclo.campanaId,loteId)
  const cultivoCtx: any = useContext(CultivoContext);
  const crops = cultivoCtx?.crops || [];

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
    // Try to pre-fill cultivo and zafra from the ciclo if available
    let cultivoFromCiclo: any = null;
    if (ciclo && ciclo.cultivoId && Array.isArray(crops)) {
      cultivoFromCiclo = crops.find(
        (c: any) => c?._id === ciclo.cultivoId || c?.id === ciclo.cultivoId,
      );
    }

    setActividad({
      ...cleanAct,
      tipo: activityType,
      // Extra fields so the planning form can auto-fill Crop and Zafra
      ...(cultivoFromCiclo && ({ cultivo: cultivoFromCiclo } as any)),
      ...(ciclo?.zafra && ({ zafra: ciclo.zafra } as any)),
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
          background: "#1976d2",
          color: "white",
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
        {...{ open, handleClose, actividad, refreshCiclos, editing: false, ciclo }}
      />
    </React.Fragment>
  );
}
