import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { Campaign } from "@types";
import { es } from "date-fns/locale";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";

const CreateCampaignModal = ({
  open,
  onClose,
  onCreate,
  initialData,
  editMode,
  onDelete,
}: {
  onDelete?: (e: any) => any;
  initialData?: Campaign;
  editMode?: boolean;
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [state, setState] = useState("");
  const [zafra, setZafra] = useState("");
  const { t } = useTranslation();

  // Lista de zafras comunes
  const zafrasOptions = [
    { value: "2023/2024", label: "2023/2024" },
    { value: "2024/2025", label: "2024/2025" },
    { value: "2025/2026", label: "2025/2026" },
    { value: "gruesa", label: "Gruesa" },
    { value: "fina", label: "Fina" },
    { value: "invierno", label: "Invierno" },
    { value: "verano", label: "Verano" },
    { value: "primera", label: "Primera" },
    { value: "segunda", label: "Segunda" },
  ];

  const title = editMode ? t("Edit_campaign") : t("create_new_campaign");

  useEffect(() => {
    if (initialData && editMode) {
      setName(initialData.name);
      setDescription(initialData.description);
      setZoneId(initialData.zoneId);
      setStartDate(initialData.startDate);
      setEndDate(initialData.endDate);
      setState(initialData.state);
      setZafra(initialData.zafra || "");

      // TODO Load data to form
    }
  }, [initialData]);

  const handleCreate = () => {
    if (editMode) {
      onCreate({
        ...initialData,
        campaignId: name,
        name,
        description,
        zoneId,
        startDate,
        endDate,
        state,
        zafra,
      });
    } else {
      onCreate({
        campaignId: name,
        name,
        description,
        zoneId,
        startDate,
        endDate,
        state,
        zafra,
      });
    }
    // Reset form
    setName("");
    setDescription("");
    setZoneId("");
    setStartDate("");
    setEndDate("");
    setState("");
    setZafra("");
  };

  function onDeleteHandler(
    event: MouseEvent<HTMLButtonElement, MouseEvent>,
  ): void {
    onDelete(initialData);
    throw new Error("Function not implemented.");
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label={t("campaign_name")}
          type="text"
          fullWidth
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          margin="dense"
          id="description"
          label={t("description")}
          type="text"
          fullWidth
          variant="outlined"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <TextField
          margin="dense"
          id="zoneId"
          label={t("zone_id")}
          type="text"
          fullWidth
          variant="outlined"
          value={zoneId}
          onChange={(e) => setZoneId(e.target.value)}
        />

        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
          <TextField
            margin="dense"
            id="startDate"
            label={t("start_date")}
            type="date"
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <TextField
            margin="dense"
            id="endDate"
            label={t("end_date")}
            type="date"
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </LocalizationProvider>
        <FormControl fullWidth margin="dense">
          <InputLabel id="zafra-label">Zafra</InputLabel>
          <Select
            labelId="zafra-label"
            id="zafra"
            value={zafra}
            label="Zafra"
            onChange={(e) => setZafra(e.target.value)}
          >
            <MenuItem value="">
              <em>Seleccionar zafra</em>
            </MenuItem>
            {zafrasOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="dense">
          <InputLabel id="state-label">{t("state")}</InputLabel>
          <Select
            labelId="state-label"
            id="state"
            value={state}
            label={t("state")}
            onChange={(e) => setState(e.target.value)}
          >
            <MenuItem value={"Active"}>{t("active")}</MenuItem>
            <MenuItem value={"Inactive"}>{t("inactive")}</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        {/* {editMode && onDelete && */}
        {/*   <Button variant="contained" color="error" onClick={onDeleteHandler}>{t("delete")}</Button> */}
        {/* } */}

        <Button onClick={onClose}>{t("cancel")}</Button>
        {editMode ? (
          <Button onClick={handleCreate}>{t("save")}</Button>
        ) : (
          <Button onClick={handleCreate}>{t("create")}</Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CreateCampaignModal;
