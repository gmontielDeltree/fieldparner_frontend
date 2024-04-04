import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import DateRangePicker from "./DateRangePicker";
import { Autocomplete } from "@mui/material";
import { useCiclo } from "../../hooks/usePlanifications";
import { CultivoContext } from "./contexts/CultivosContext";
import { CultivoItem } from "../../hooks";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function CicloEditorDialog({campanaId, loteId, editor, cicloId, onSave}) {

  const [ciclo,saveCiclo] = useCiclo({ campaingId: campanaId , loteId: loteId, cicloId: cicloId } )

  const { i18n } = useTranslation();

  const [open, setOpen] = React.useState(false);
  const [cultivo, setCultivo] = React.useState<CultivoItem>()
  const [startDate, setStartDate] = React.useState(new Date())
  const [endDate, setEndDate] = React.useState(new Date())

  const {crops,getCrops} = React.useContext(CultivoContext)

  useEffect(()=>{
    getCrops()
  },[])

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <React.Fragment>
      <Button variant="contained"  onClick={handleClickOpen}>
        + Ciclo
      </Button>
      <Dialog
      
        open={open}
        onClose={handleClose}
        PaperProps={{
          component: "form",
          onClick: e => e.stopPropagation(),
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
        <DialogTitle>Nuevo Ciclo {campanaId}</DialogTitle>
        <DialogContent>
          <DialogContentText>
          </DialogContentText>


          <Autocomplete
          style={{marginBottom:"1rem",marginTop:"1rem"}}
            disablePortal
            value={cultivo}
            id="combo-box-demo"
            options={crops}
            getOptionLabel={(option) => option.descriptionEN}
            sx={{ width: 300 }}
            isOptionEqualToValue={(option,value)=>option._id ===value._id}
            onChange={(event: any, newValue: string | null)=>setCultivo(newValue)}
            renderInput={(params) => <TextField {...params} label="Cultivo" />}
          />

          <DateRangePicker  startDate={startDate} endDate={endDate} onRangeChange={(s,e)=>{
            console.log(s,e)
            setStartDate(s)
            setEndDate(e)
          }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button type="submit" disabled={!cultivo} onClick={()=>{
            console.log(cultivo)
            if(cultivo){
              saveCiclo(campanaId,loteId,cultivo._id,startDate,endDate)
              onSave()
            }
          }}>Aceptar</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}