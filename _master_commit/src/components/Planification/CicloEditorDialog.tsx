import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import DateRangePicker from "./DateRangePicker";
import { Autocomplete, Box, Typography, Chip, Alert, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useCiclo } from "../../hooks/usePlanifications";
import { CultivoContext } from "./contexts/CultivosContext";
import { CultivoItem, useCampaign } from "../../hooks";
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ICiclosPlanificacion } from "../../interfaces/planification";
import { add, isWithinInterval } from "date-fns";
import { AutocompleteCultivo } from "../LotsMenu/components/AutocompleteCultivo";
import { CampanasContext } from "./contexts/CampanasContext";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EventIcon from '@mui/icons-material/Event';

export default function CicloEditorDialog({
  campanaId,
  loteId,
  editor,
  cicloId,
  onSave,
  otrosCiclos,
}: {
  campanaId: string;
  loteId: string;
  editor?: any;
  cicloId?: string;
  onSave: () => void;
  otrosCiclos: ICiclosPlanificacion[];
}) {
  const [ciclo, saveCiclo] = useCiclo({
    campaingId: campanaId,
    loteId: loteId,
    cicloId: cicloId,
  });

  const { t, i18n } = useTranslation();
  const { getCampanaDesc } = useContext(CampanasContext);
  const { campaigns, getCampaigns } = useCampaign();

  const [open, setOpen] = React.useState(false);
  const [cultivo, setCultivo] = React.useState<CultivoItem>();
  const [selectedZafra, setSelectedZafra] = useState<string>('');
  const [campaignZafras, setCampaignZafras] = useState<string[]>([]);
  const [startDate, setStartDate] = React.useState(new Date());
  const [endDate, setEndDate] = React.useState(add(new Date(), { months: 5 }));

  const { crops, getCrops } = React.useContext(CultivoContext);

  const [maxDate, invalidRanges] = useMemo(() => {
    if (otrosCiclos?.length) {
      console.log("OTROS CICLOS", otrosCiclos);
      let dates = otrosCiclos.map((c) => new Date(c.fechaFin)).filter(d => !isNaN(d.getTime()));
      let maxDate = dates.length ? new Date(Math.max(...dates.map(d => d.getTime()))) : new Date();

      let invalidRanges = otrosCiclos
        .map((c) => [new Date(c.fechaInicio), new Date(c.fechaFin)])
        .filter((range) => !isNaN(range[0].getTime()) && !isNaN(range[1].getTime()));

      console.log("MAX DATE", maxDate, "invalidRanges", invalidRanges);
      setStartDate(add(maxDate, { days: 1 }));
      setEndDate(add(maxDate, { months: 5 }));
      return [maxDate, invalidRanges];
    } else {
      return [undefined, []];
    }
  }, [otrosCiclos]);

  const checkRangeIsValid = useCallback((sd, ed) => {

    if (!invalidRanges) {
      return true;
    }
    return !invalidRanges.some((r) =>
      isWithinInterval(r[0], { start: sd, end: ed })
    );

  }, [invalidRanges]);

  useEffect(() => {
    if (!open) return;

    if (!crops?.length) {
      getCrops();
    }

    if (!campaigns.length) {
      getCampaigns();
    }
    // getCrops/getCampaigns come from custom hooks and are not memoized.
    // We only want to load dependencies when the dialog is actually opened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, crops?.length, campaigns.length]);

  // Cargar zafras cuando se abre el diálogo y se tienen las campañas
  useEffect(() => {
    if (open && campanaId && campaigns.length > 0) {
      const campaign = campaigns.find(c => c._id === campanaId);
      if (campaign && campaign.zafra) {
        // Si zafra es un array, usarlo directamente, si es string, convertir a array
        const zafrasFromCampaign = Array.isArray(campaign.zafra)
          ? campaign.zafra
          : (typeof campaign.zafra === 'string' ? [campaign.zafra] : []);

        setCampaignZafras(zafrasFromCampaign);
        console.log('🌾 Zafras disponibles de la campaña:', zafrasFromCampaign);

        // Seleccionar la primera zafra por defecto si hay disponibles
        if (zafrasFromCampaign.length > 0 && !selectedZafra) {
          setSelectedZafra(zafrasFromCampaign[0]);
        }
      } else {
        console.log('⚠️ La campaña no tiene zafras definidas');
        setCampaignZafras([]);
      }
    }
  }, [open, campanaId, campaigns]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <React.Fragment>
      <Button
        variant="contained"
        onClick={handleClickOpen}
        startIcon={<AddCircleOutlineIcon />}
        size="small"
        sx={{
          backgroundColor: '#2e7d32',
          '&:hover': {
            backgroundColor: '#1b5e20'
          }
        }}
      >
        {t('newHarvest')}
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          component: "form",
          onClick: (e) => e.stopPropagation(),
          onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries((formData as any).entries());
            const email = formJson.email;
            console.log(email);
            handleClose();
          },
        }}
      >
        <DialogTitle sx={{
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <EventIcon color="primary" />
          {t('Nueva Zafra/Ciclo Productivo')}
        </DialogTitle>
        <DialogContent sx={{ paddingTop: '20px' }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {t('Creando zafra para la campaña')}:
              </Typography>
              <Chip
                label={getCampanaDesc(campanaId) || campanaId}
                color="primary"
                size="small"
                sx={{ fontWeight: 'bold' }}
              />
            </Box>
          </Alert>

          <DialogContentText sx={{ mb: 2 }}>
            {t('Configure el cultivo y las fechas para este ciclo productivo')}
          </DialogContentText>

          {/* Selector de zafra de la campaña */}
          {campaignZafras.length > 0 ? (
            <Box sx={{ marginBottom: "1rem", marginTop: "1rem" }}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('Seleccione la zafra')}</InputLabel>
                <Select
                  value={selectedZafra}
                  onChange={(e) => setSelectedZafra(e.target.value)}
                  label={t('Seleccione la zafra')}
                >
                  {campaignZafras.map((zafra) => (
                    <MenuItem key={zafra} value={zafra}>
                      {zafra}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {t('Zafras definidas en la campaña')} {getCampanaDesc(campanaId)}
              </Typography>
            </Box>
          ) : (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {t('Esta campaña no tiene zafras definidas. Por favor, defina las zafras en la configuración de la campaña.')}
            </Alert>
          )}

          <Box style={{ marginBottom: "1rem", marginTop: "1rem" }}>
            <AutocompleteCultivo
              onChange={(value) => setCultivo(value)}
              label={t('Seleccione el cultivo para esta zafra')}
            />
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
              {t('Período del ciclo productivo')}:
            </Typography>
            <DateRangePicker
              invalidRanges={invalidRanges}
              startDate={startDate}
              endDate={endDate}
              onRangeChange={(s, e) => {
                console.log(s, e);
                setStartDate(s);
                setEndDate(e);
              }}
            />
          </Box>

          {!checkRangeIsValid(startDate, endDate) && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {t("El rango seleccionado incluye uno o mas ciclos")}
            </Alert>
          )}

          {otrosCiclos?.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                {t('Ciclos existentes en este lote')}: {otrosCiclos.length}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px', backgroundColor: '#f5f5f5' }}>
          <Button onClick={handleClose} color="inherit">
            {t('Cancelar')}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!cultivo || !checkRangeIsValid(startDate, endDate) || (campaignZafras.length > 0 && !selectedZafra)}
            onClick={() => {
              console.log('Creando ciclo:', { cultivo, selectedZafra, startDate, endDate });
              if (cultivo) {
                if (checkRangeIsValid(startDate, endDate)) {
                  // Pasar la zafra seleccionada a saveCiclo
                  saveCiclo(campanaId, loteId, cultivo._id, startDate, endDate, selectedZafra);

                  console.log('✅ Ciclo guardado con zafra:', selectedZafra);

                  onSave();
                  handleClose();

                  // Limpiar el estado al cerrar
                  setSelectedZafra('');
                }
              }
            }}
          >
            {t('Crear Zafra')}
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
