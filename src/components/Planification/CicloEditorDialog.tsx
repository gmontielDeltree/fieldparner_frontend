import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import DateRangePicker from "./DateRangePicker";
import { Autocomplete, Box, Typography } from "@mui/material";
import { useCiclo } from "../../hooks/usePlanifications";
import { CultivoContext } from "./contexts/CultivosContext";
import { CultivoItem } from "../../hooks";
import React, { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ICiclosPlanificacion } from "../../interfaces/planification";
import { add, isWithinInterval } from "date-fns";
import { AutocompleteCultivo } from "../LotsMenu/components/AutocompleteCultivo";

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

  const [open, setOpen] = React.useState(false);
  const [cultivo, setCultivo] = React.useState<CultivoItem>();
  const [startDate, setStartDate] = React.useState(new Date());
  const [endDate, setEndDate] = React.useState(add(new Date(), { months: 5 }));

  const { crops, getCrops } = React.useContext(CultivoContext);

  const [maxDate, invalidRanges] = useMemo(() => {
    if (otrosCiclos?.length) {
      console.log("OTROS CICLOS", otrosCiclos);
      let dates = otrosCiclos.map((c) => new Date(c.fechaFin));
      let maxDate = new Date(Math.max(...dates));
      let invalidRanges = otrosCiclos.map((c) => [
        new Date(c.fechaInicio),
        new Date(c.fechaFin),
      ]);

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
    getCrops();
  }, []);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <React.Fragment>
      <Button variant="contained" onClick={handleClickOpen}>
        + Zafra
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
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
        <DialogTitle>Nueva Zafra {campanaId}</DialogTitle>
        <DialogContent>
          <DialogContentText></DialogContentText>


          <Box style={{ marginBottom: "1rem", marginTop: "1rem" }}
          >
            <AutocompleteCultivo
              onChange={(value) =>
                setCultivo(value)
              }
            ></AutocompleteCultivo>
          </Box>

          {/* <Autocomplete
            style={{ marginBottom: "1rem", marginTop: "1rem" }}
            disablePortal
            value={cultivo}
            id="combo-box-demo"
            options={crops}
            getOptionLabel={(option) => option.descriptionEN}
            sx={{ width: 300 }}
            isOptionEqualToValue={(option, value) => option._id === value._id}
            onChange={(event: any, newValue: string | null) =>
              setCultivo(newValue)
            }
            renderInput={(params) => <TextField {...params} label="Cultivo" />}
          /> */}

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

          {!checkRangeIsValid(startDate, endDate) && (
            <Typography>
              {t("El rango seleccionado incluye uno o mas ciclos")}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button
            type="submit"
            disabled={!cultivo || !checkRangeIsValid(startDate, endDate)}
            onClick={() => {
              console.log(cultivo);
              if (cultivo) {
                if (checkRangeIsValid(startDate, endDate)) {
                  saveCiclo(campanaId, loteId, cultivo._id, startDate, endDate);
                  onSave();
                }
              }
            }}
          >
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
