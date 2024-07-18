import React, { useEffect, useState } from "react";
import {
  FormControl,
  Grid,
  Select,
  InputLabel,
  MenuItem,
  TextField,
  IconButton,
  List,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  Link
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import { styled, keyframes } from "@mui/material/styles";
import uuid4 from "uuid4";
import { useAppDispatch, useCrops, useForm, useSupply } from "../../../../hooks";
import Chip from "@mui/material/Chip";
import { useDeposit } from "../../../../hooks";
import { useTranslation } from "react-i18next";
import { NumberFieldWithUnits } from "../../components/NumberField";
import { AutocompleteSupplies } from "../../components/AutocompleteSupplies";
import { Deposit, Supply, Crops } from "@types";
import { AutocompleteDeposito } from "../../components/AutocompleteDeposito";
import { TTipoActividadPlanificada } from "../../../../interfaces/planification";
import { log } from "xstate";
import Swal from "sweetalert2";

const TypeBadge = styled(Chip)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  fontSize: "0.75rem",
  height: "auto",
  padding: "0 6px"
}));

const flashFadeAnimation = keyframes`
  0% {
    background-color: red;
    opacity: 1;
  }
  50% {
    background-color: red;
  }
  100% {
    opacity: 0;
  }
`;

const CustomListItem = styled(Card)(({ deleting }) => ({
  margin: "10px 0",
  backgroundColor: "#f9f9f9",
  borderRadius: "8px",
  animation: deleting ? `${flashFadeAnimation} 1s forwards` : "none"
}));

const Title = styled(Typography)({
  fontSize: "1.5em",
  fontWeight: "bold",
  color: "#333",
  marginBottom: "20px"
});

const CustomPaper = styled(Paper)({
  padding: "20px",
  margin: "20px 0",
  backgroundColor: "#f7f7f7"
});

function SuppliesForm({ lot, db, formData, setFormData }) {
  const { t } = useTranslation();
  const [selectedSupply, setSelectedSupply] = useState<Supply>();
  const [selectedCrops, setSelectedCrops] = useState<Crops>();
  const [dosificacion, setDosificacion] = useState("");
  const [total, setTotal] = useState("");
  const [precio, setPrecio] = useState("");
  const [costoTotal, setCostoTotal] = useState(0);
  const [nroLote, setNroLote] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [rows, setRows] = useState([]);
  const [editIndex, setEditIndex] = useState(-1);
  const [deposito, setDeposito] = useState<Deposit>();
  const { isLoading, supplies, getSupplies, setSupplies, deleteSupply } = useSupply();
  const {getCrops,crops }  = useCrops();
  const { deposits, getDeposits } = useDeposit();
  const [editData, setEditData] = useState({
    selectedOption: "",
    dosificacion: "",
    nro_lote: 0,
    ubicacion: "",
    total: "",
    deposito: {},
    precio: ""
  });

  const findInsumoByOption = (option) => {
    return supplies.find((supply) => supply.name === option);
  };
  const handleAddRow = () => {
    const supply = selectedSupply;
    const { descriptionES } = formData.detalles.cultivo;
    if (supply && supply.type === "Semillas") {
      const cropId = supply?.cropId;
      if (cropId && cropId !== descriptionES) {
        Swal.fire({
          icon: 'error',
          title: 'Insumo incompatible',
          text: 'El insumo seleccionado no es compatible con el cultivo'
        });
        return; 
      }
    }
  

    const newRow = {
      dosis: dosificacion,
      insumo: selectedSupply,
      nro_lote: nroLote,
      ubicacion: ubicacion,
      motivos: [],
      uuid: uuid4(),
      total: total,
      deposito: deposito,
      precio_estimado: precio
    };
  
    const newDetalles = [...formData.detalles.dosis, newRow];
    setFormData({
      ...formData,
      detalles: { ...formData.detalles, dosis: newDetalles }
    });
  
    console.log("NUEVA FILA", newRow);
    setSelectedSupply("");
    setDosificacion("");
    setTotal("");
    setDeposito("");
    setNroLote("");
    setUbicacion("");
    setPrecio("");
    setSelectedCrops("");
  };

  const handleSaveEdit = () => {
    if (!editData.selectedOption) {
      alert("Buen hombre seleccione un insumo antes de guardar!!!");
      return;
    }
    const updatedRow = {
      dosis: editData.dosificacion,
      insumo: editData.selectedOption,
      motivos: [],
      uuid: rows[editIndex].uuid,
      nro_lote: editData.nro_lote,
      ubicacion: editData.ubicacion,
      deposito: editData.deposito,
      total: editData.total,
      precio_estimado: editData.precio
    };
    const updatedDetalles = [...formData.detalles.dosis];
    updatedDetalles[editIndex] = updatedRow;
    setFormData({
      ...formData,
      detalles: { ...formData.detalles, dosis: updatedDetalles }
    });
    setEditIndex(-1);
  };

  const handleSelectChange = (event) => {
    console.log(event);
    setSelectedSupply(event);
  };

  const handleDosificacionChange = (event) => {
    setDosificacion(event.target.value);
    setTotal((+event.target.value * formData.detalles.hectareas).toFixed(2));
    setCostoTotal(
      (+event.target.value * formData.detalles.hectareas * +precio).toFixed(2)
    );
  };

  const handleDepositoChange = (event) => {
    setDeposito(event);
  };

  const handleLotNumberChange = (event) => {
    setNroLote(event.target.value);
  };

  const handleUbicacionChange = (event) => {
    setUbicacion(event.target.value);
  };

  const handleTotalChange = (event) => {
    setTotal(event.target.value);
    setDosificacion(
      (+event.target.value / formData.detalles.hectareas).toFixed(2)
    );
    setCostoTotal((+event.target.value * +precio).toFixed(2));
  };

  const handlePrecioChange = (event) => {
    setPrecio(event.target.value);
    setCostoTotal((+event.target.value * +total).toFixed(2));
  };

  const handleCostoTotalChange = (event) => {
    setCostoTotal(+event.target.value);
    setPrecio((+total / +event.target.value).toFixed(2));
  };

  const handleEditRow = (index) => {
    setEditIndex(index);
    setEditData({ ...rows[index] });
  };

  const handleCancelEdit = () => {
    setEditIndex(-1);
  };

  const handleDeleteRow = (index) => {
    setRows(
      rows.map((row, idx) => (idx === index ? { ...row, deleting: true } : row))
    );

    setTimeout(() => {
      const updatedDetalles = formData.detalles.dosis.filter(
        (_, idx) => idx !== index
      );
      setFormData({
        ...formData,
        detalles: { ...formData.detalles, dosis: updatedDetalles }
      });
    }, 1000);
  };

  const handleEditChange = (prop) => (event) => {
    setEditData({ ...editData, [prop]: event.target.value });
  };

  const handleEditSupplyChange = (supply) => {
    setEditData({ ...editData, selectedOption: supply });
  };

  const handleEditDepositoChange = (deposito) => {
    setEditData({ ...editData, deposito: deposito });
  };

  const handleEditCantidadPorHaChange = (event) => {
    setEditData({
      ...editData,
      dosificacion: event.target.value,
      total: (+event.target.value * formData.detalles.hectareas).toFixed(2),
      costo_total: (
        +event.target.value *
        formData.detalles.hectareas *
        editData.precio
      ).toFixed(2)
    });
  };

  const handleEditCantidadTotalChange = (event) => {
    setEditData({
      ...editData,
      total: event.target.value,
      dosificacion: (+event.target.value / formData.detalles.hectareas).toFixed(
        2
      ),
      costo_total: (+event.target.value * editData.precio).toFixed(2)
    });
  };

  const handleEditNroLoteChange = (event) => {
    setEditData({ ...editData, nro_lote: event.target.value });
  };

  const handleEditUbicacionChange = (event) => {
    setEditData({ ...editData, ubicacion: event.target.value });
  };

  const handleEditCostoTotalChange = (event) => {
    setEditData({
      ...editData,
      costo_total: event.target.value,
      precio: (+editData.total / +event.target.value).toFixed(2)
    });
  };

  const handleEditPrecioUnitarioChange = (event) => {
    setEditData({
      ...editData,
      precio: event.target.value,
      costo_total: (+editData.total / +event.target.value).toFixed(2)
    });
  };

  useEffect(() => {
    getSupplies();
    getDeposits();
    getCrops();
  }, []);

  useEffect(() => {
    if (supplies.length) {
      console.log("Fetched supplies:", supplies);
    }
  }, [supplies]);

  useEffect(() => {
    if (crops.length) {
      console.log("Fetched supplies:", crops);
    }
  }, [crops]);

  useEffect(() => {
    if (formData && formData.detalles && formData.detalles.dosis) {
      setRows(
        formData.detalles.dosis.map((dosis) => ({
          selectedOption: dosis.insumo,
          dosificacion: dosis.dosis,
          total: dosis.total,
          deposito: dosis.deposito,
          nro_lote: dosis.nro_lote,
          ubicacion: dosis.ubicacion,
          precio: dosis.precio_estimado,
          uuid: dosis.uuid
        }))
      );
    }
  }, [formData]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <CustomPaper elevation={3}>
      <Title>Insumos</Title>
      <FormControl fullWidth>
        <Grid container spacing={2}>
          {/* Línea 1: Insumo, Descripción */}
          <Grid container item xs={12} spacing={1}>
            <Grid item xs={6}>
              <AutocompleteSupplies
                value={selectedSupply}
                onChange={handleSelectChange}
              />
            </Grid>
            <Grid item xs={6}>
              <Paper sx={{ width: "100%", padding: "17px" }}>
                {selectedSupply?.description && (
                  <Typography variant="body2" gutterBottom>
                    {selectedSupply?.description} {selectedSupply?.type}
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* Línea 2: Deposito, Nro de Lote, Ubicacion */}
          <Grid container item xs={12} spacing={1}>
            <Grid item xs={4}>
              <AutocompleteDeposito
                value={deposito}
                onChange={handleDepositoChange}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Nro de Lote"
                value={nroLote}
                onChange={handleLotNumberChange}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Ubicacion"
                value={ubicacion}
                onChange={handleUbicacionChange}
              />
            </Grid>
          </Grid>

          {/* Línea 3: Cantidad, Cant Total */}
          <Grid container item xs={12} spacing={1}>
            <Grid item xs={6}>
              <NumberFieldWithUnits
                fullWidth
                label="Cantidad"
                value={dosificacion}
                onChange={handleDosificacionChange}
                unit={selectedSupply?.unitMeasurement || "unit"}
              />
            </Grid>
            <Grid item xs={5}>
              <NumberFieldWithUnits
                fullWidth
                label="Cant Total"
                value={total}
                onChange={handleCostoTotalChange}
                unit={selectedSupply?.unitMeasurement || "unit"}
              />
            </Grid>

            <Grid item xs={1}>
              <IconButton
                onClick={handleAddRow}
                color="primary"
                aria-label="add"
              >
                <AddIcon />
              </IconButton>
            </Grid>
          </Grid>
        </Grid>
      </FormControl>

      {/* Displaying Rows */}
      <Box mt={3}>
        <Typography variant="h6">Insumos agregados</Typography>
        <List>
          {rows.map((row, index) => (
            <CustomListItem key={index} deleting={row.deleting}>
              <CardContent>
                <Grid container alignItems="center" spacing={1}>
                  {/* Editable fields when in edit mode */}
                  {editIndex === index ? (
                    <>
                      <Grid container item xs={12} spacing={1}>
                        <Grid item xs={10}>
                          <AutocompleteSupplies
                            value={editData.selectedOption}
                            onChange={handleEditSupplyChange}
                          />
                        </Grid>
                        <Grid item xs={2}>
                          <AutocompleteDeposito
                            value={editData.deposito}
                            onChange={handleEditDepositoChange}
                          />
                        </Grid>
                      </Grid>
                      <Grid container item xs={12} spacing={1}>
                        <Grid item xs={5}>
                          <NumberFieldWithUnits
                            size="small"
                            fullWidth
                            label={t("_quantity_per_hectare")}
                            value={+editData.dosificacion}
                            onChange={handleEditCantidadPorHaChange}
                            unit="unit/ha"
                          />
                        </Grid>
                        <Grid item xs={5}>
                          <NumberFieldWithUnits
                            fullWidth
                            label={t("_total_quantity")}
                            value={+editData.total}
                            onChange={handleEditCantidadTotalChange}
                            unit="ha"
                          />
                        </Grid>


                        <Grid item xs={5}>
                          <TextField
                            fullWidth
                            label="Nro de Lote"
                            value={editData.nro_lote}
                            onChange={handleEditNroLoteChange}
                          />
                        </Grid>
                        <Grid item xs={5}>
                          <TextField
                            fullWidth
                            label="Ubicacion"
                            value={editData.ubicacion}
                            onChange={handleEditUbicacionChange}
                          />
                        </Grid>
                      </Grid>
                    </>
                  ) : (
                    <>
                      <Grid container item xs={12}>
                        <Grid item xs={10}>
                          <Typography variant="subtitle1">
                            {row.selectedOption.name}
                          </Typography>
                        </Grid>
                        <Grid item xs={2}>
                          <Typography variant="subtitle2">
                            {row.selectedOption.type}
                          </Typography>
                        </Grid>

                        <Grid item xs={12}>
                          <Typography variant="subtitle2">
                            {row.selectedOption.description}
                          </Typography>
                        </Grid>
                      </Grid>
                      <Grid container item xs={12}>
                        <Grid item xs={3}>
                          <Typography
                            variant="caption"
                            title={row.selectedOption?.unitMeasurement + "/ha"}
                          >
                            <strong>{t("_quantity_per_hectare")}:</strong>{" "}
                            {row.dosificacion}{" "}
                            {abrUnit(row.selectedOption?.unitMeasurement)}/ha
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography
                            variant="caption"
                            title={row.selectedOption?.unitMeasurement}
                          >
                            <strong>{t("_total_quantity")}:</strong> {row.total}{" "}
                            {abrUnit(row.selectedOption?.unitMeasurement)}
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="caption">
                            <strong>{t("Ubicacion")}:</strong> {row.ubicacion}
                          </Typography>

                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="caption">
                            <strong>{t("Nro lote")}:</strong> {row.nro_lote}
                          </Typography>
                        </Grid>

                      </Grid>
                    </>
                  )}
                  <Grid item xs={12} style={{ textAlign: "center" }}>
                    {editIndex === index ? (
                      <>
                        <IconButton
                          color="primary"
                          aria-label="save"
                          onClick={handleSaveEdit}
                        >
                          <SaveIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          aria-label="cancel"
                          onClick={handleCancelEdit}
                        >
                          <CloseIcon />
                        </IconButton>
                      </>
                    ) : (
                      <>
                        <IconButton
                          color="primary"
                          aria-label="edit"
                          onClick={() => handleEditRow(index)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          aria-label="delete"
                          onClick={() => handleDeleteRow(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                  </Grid>
                </Grid>
              </CardContent>
            </CustomListItem>
          ))}
        </List>
      </Box>
    </CustomPaper>
  );
}

function abrUnit(unit: string) {
  if (!unit) return "unit";

  let splited = unit.split("/");
  if (splited.length > 0) {
    let ns = splited.map((u) => (u.length > 7 ? u.slice(0, 7) + ".." : u));
    return ns.join("/");
  } else {
    let ns = unit.length > 6 ? unit.slice(6) + ".." : unit;
    return ns;
  }
}
export default SuppliesForm;
