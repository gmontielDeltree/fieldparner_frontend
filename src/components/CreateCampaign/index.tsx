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
  Chip,
  Box,
  Typography,
  IconButton,
  Autocomplete,
  Paper,
  Divider,
  Tooltip,
  Fade,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Close as CloseIcon,
  CalendarToday,
  Grain,
} from "@mui/icons-material";
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
  const [zafras, setZafras] = useState<string[]>([]);
  const [currentZafra, setCurrentZafra] = useState("");
  const [customZafra, setCustomZafra] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const { t } = useTranslation();

  // Lista de zafras comunes y sugerencias
  const currentYear = new Date().getFullYear();
  
  // Generar opciones de zafra basadas en las fechas de la campaña
  const generateZafraOptions = () => {
    const baseOptions = [];
    
    // Opciones de zafras simplificadas
    const zafrasPredefinidas = [
      { value: "fina_invierno", label: "Fina Invierno", category: "Zafras", months: [4,5,6,7] },
      { value: "fina_verano", label: "Fina Verano", category: "Zafras", months: [10,11,0,1] },
      { value: "gruesa_verano", label: "Gruesa Verano", category: "Zafras", months: [10,11,0,1,2] },
      { value: "gruesa_invierno", label: "Gruesa Invierno", category: "Zafras", months: [4,5,6,7,8] },
    ];
    
    // Si hay fechas de campaña, marcar las recomendadas
    if (startDate && endDate) {
      const startMonth = new Date(startDate).getMonth();
      const endMonth = new Date(endDate).getMonth();
      
      zafrasPredefinidas.forEach(zafra => {
        const isRelevant = zafra.months.some(m => 
          (startMonth <= endMonth && m >= startMonth && m <= endMonth) ||
          (startMonth > endMonth && (m >= startMonth || m <= endMonth))
        );
        baseOptions.push({ ...zafra, recommended: isRelevant });
      });
    } else {
      // Sin fechas, mostrar todas las opciones sin recomendación
      baseOptions.push(...zafrasPredefinidas);
    }
    
    return baseOptions;
  };
  
  const zafrasOptions = generateZafraOptions();

  const title = editMode ? t("Edit_campaign") : t("create_new_campaign");

  useEffect(() => {
    if (initialData && editMode) {
      console.log('🔧 CreateCampaign - Loading initial data for edit:', initialData);
      console.log('🔧 CreateCampaign - Initial zafra value:', initialData.zafra);
      console.log('🔧 CreateCampaign - Initial zafra type:', typeof initialData.zafra);
      console.log('🔧 CreateCampaign - Is zafra array?:', Array.isArray(initialData.zafra));
      
      setName(initialData.name);
      setDescription(initialData.description);
      setZoneId(initialData.zoneId);
      setStartDate(initialData.startDate);
      setEndDate(initialData.endDate);
      setState(initialData.state);
      // Si zafra es string, convertir a array. Si es array, usar directamente
      if (initialData.zafra) {
        if (typeof initialData.zafra === 'string') {
          console.log('🔧 CreateCampaign - Converting string zafra to array');
          setZafras([initialData.zafra]);
        } else if (Array.isArray(initialData.zafra)) {
          console.log('🔧 CreateCampaign - Setting zafra array:', initialData.zafra);
          setZafras(initialData.zafra);
        }
      } else {
        console.log('🔧 CreateCampaign - No zafra found in initial data, setting empty array');
        setZafras([]);
      }
    }
  }, [initialData, editMode]);

  const handleAddZafra = () => {
    const zafraToAdd = showCustomInput ? customZafra.trim() : currentZafra;
    
    if (zafraToAdd && !zafras.includes(zafraToAdd)) {
      setZafras([...zafras, zafraToAdd]);
      setCurrentZafra("");
      setCustomZafra("");
      setShowCustomInput(false);
    }
  };

  const handleRemoveZafra = (zafraToRemove: string) => {
    setZafras(zafras.filter(z => z !== zafraToRemove));
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddZafra();
    }
  };

  const handleCreate = () => {
    console.log('🚀 CreateCampaign - handleCreate called');
    console.log('🚀 CreateCampaign - zafras to save:', zafras);
    console.log('🚀 CreateCampaign - zafras length:', zafras.length);
    
    if (editMode) {
      const campaignData = {
        ...initialData,
        campaignId: name,
        name,
        description,
        zoneId,
        startDate,
        endDate,
        state,
        zafra: zafras, // Ahora enviamos el array de zafras
      };
      console.log('🚀 CreateCampaign - Sending campaign data (edit):', campaignData);
      onCreate(campaignData);
    } else {
      const campaignData = {
        campaignId: name,
        name,
        description,
        zoneId,
        startDate,
        endDate,
        state,
        zafra: zafras, // Ahora enviamos el array de zafras
      };
      console.log('🚀 CreateCampaign - Sending campaign data (create):', campaignData);
      onCreate(campaignData);
    }
    // Reset form
    setName("");
    setDescription("");
    setZoneId("");
    setStartDate("");
    setEndDate("");
    setState("");
    setZafras([]);
    setCurrentZafra("");
    setCustomZafra("");
    setShowCustomInput(false);
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
        
        {/* Sección de Zafras con diseño moderno */}
        <Box sx={{ mt: 2, mb: 1 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500, color: 'text.secondary' }}>
            <Grain sx={{ fontSize: 20, verticalAlign: 'middle', mr: 0.5 }} />
            Zafras / Ciclos Productivos
          </Typography>
          
          {/* Chips de zafras agregadas */}
          {zafras.length > 0 && (
            <Paper elevation={0} sx={{ 
              p: 1.5, 
              mb: 2, 
              bgcolor: 'grey.50', 
              border: '1px solid',
              borderColor: 'grey.200',
              borderRadius: 2
            }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {zafras.map((zafra, index) => (
                  <Fade in key={zafra} timeout={300 * (index + 1)}>
                    <Chip
                      label={zafra}
                      onDelete={() => handleRemoveZafra(zafra)}
                      deleteIcon={
                        <Tooltip title="Eliminar">
                          <CloseIcon />
                        </Tooltip>
                      }
                      color="primary"
                      variant="filled"
                      sx={{
                        borderRadius: '16px',
                        '& .MuiChip-deleteIcon': {
                          color: 'rgba(255, 255, 255, 0.7)',
                          '&:hover': {
                            color: 'rgba(255, 255, 255, 1)',
                          }
                        }
                      }}
                    />
                  </Fade>
                ))}
              </Box>
            </Paper>
          )}

          {/* Input para agregar zafras */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            {!showCustomInput ? (
              <>
                <Autocomplete
                  fullWidth
                  options={zafrasOptions}
                  groupBy={(option) => option.category}
                  getOptionLabel={(option) => option.label}
                  value={zafrasOptions.find(o => o.value === currentZafra) || null}
                  onChange={(event, newValue) => {
                    setCurrentZafra(newValue ? newValue.value : '');
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="Seleccionar zafra predefinida"
                      size="small"
                      onKeyPress={handleKeyPress}
                      helperText={startDate && endDate ? "⭐ Recomendadas según el período de tu campaña" : "💡 Selecciona las fechas de campaña para ver sugerencias"}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} sx={{ 
                      ...props.sx,
                      backgroundColor: option.recommended ? 'rgba(46, 125, 50, 0.08)' : 'inherit',
                      borderLeft: option.recommended ? '3px solid #2e7d32' : 'none',
                      '&:hover': {
                        backgroundColor: option.recommended ? 'rgba(46, 125, 50, 0.12)' : 'rgba(0, 0, 0, 0.04)',
                      }
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Typography variant="body2" sx={{ flexGrow: 1 }}>
                          {option.label}
                        </Typography>
                        {option.recommended && (
                          <Chip 
                            label="Recomendado" 
                            size="small" 
                            color="success"
                            sx={{ 
                              height: 20, 
                              fontSize: '0.7rem',
                              ml: 1 
                            }} 
                          />
                        )}
                      </Box>
                    </Box>
                  )}
                  renderGroup={(params) => (
                    <li key={params.key}>
                      <Typography
                        sx={{
                          px: 2,
                          py: 0.5,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: 'text.secondary',
                          bgcolor: 'grey.100',
                        }}
                      >
                        {params.group}
                      </Typography>
                      <Box sx={{ px: 1 }}>{params.children}</Box>
                    </li>
                  )}
                />
                <Tooltip title="Agregar zafra seleccionada">
                  <IconButton 
                    color="primary" 
                    onClick={handleAddZafra}
                    disabled={!currentZafra}
                    sx={{ 
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' },
                      '&:disabled': { bgcolor: 'grey.300' }
                    }}
                  >
                    <AddIcon />
                  </IconButton>
                </Tooltip>
                <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                <Tooltip title="Agregar zafra personalizada">
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setShowCustomInput(true)}
                    sx={{ 
                      minWidth: 'auto',
                      px: 2,
                      height: 40,
                      borderStyle: 'dashed',
                    }}
                  >
                    <CalendarToday sx={{ mr: 1, fontSize: 18 }} />
                    Personalizada
                  </Button>
                </Tooltip>
              </>
            ) : (
              <>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Nombre de zafra personalizada"
                  size="small"
                  value={customZafra}
                  onChange={(e) => setCustomZafra(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ej: 2026/2027, Otoño, Tardía..."
                  autoFocus
                />
                <Tooltip title="Agregar">
                  <IconButton 
                    color="primary" 
                    onClick={handleAddZafra}
                    disabled={!customZafra.trim()}
                    sx={{ 
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' },
                      '&:disabled': { bgcolor: 'grey.300' }
                    }}
                  >
                    <AddIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Cancelar">
                  <IconButton 
                    onClick={() => {
                      setShowCustomInput(false);
                      setCustomZafra("");
                    }}
                    sx={{ color: 'grey.600' }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>

          {/* Mensajes de ayuda */}
          {zafras.length === 0 && (
            <Alert 
              severity="info" 
              sx={{ 
                mt: 2,
                '& .MuiAlert-icon': { fontSize: 20 }
              }}
            >
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                  Puedes agregar múltiples zafras o ciclos productivos
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'text.secondary' }}>
                  • <strong>Fina Invierno:</strong> Cultivos de invierno de ciclo corto
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                  • <strong>Fina Verano:</strong> Cultivos de verano de ciclo corto
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                  • <strong>Gruesa Verano:</strong> Cultivos de verano de ciclo largo
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                  • <strong>Gruesa Invierno:</strong> Cultivos de invierno de ciclo largo
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'text.secondary' }}>
                  • <strong>Personalizada:</strong> Define tu propia zafra o período
                </Typography>
              </Box>
            </Alert>
          )}
          
          {/* Validación suave de coherencia temporal */}
          {zafras.length > 0 && startDate && endDate && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                💡 Una campaña puede contener múltiples zafras según los cultivos y rotaciones planificadas
              </Typography>
            </Box>
          )}
        </Box>
        
        <Divider sx={{ my: 2 }} />
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
