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
  Link,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import { styled, keyframes } from "@mui/material/styles";
import uuid4 from "uuid4";
import { useAppDispatch, useForm, useSupply } from "../../../../hooks";
import Chip from "@mui/material/Chip";
import { useDeposit } from "../../../../hooks";
import { useTranslation } from "react-i18next";
import { NumberFieldWithUnits } from "../../components/NumberField";
import { AutocompleteSupplies } from "../../components/AutocompleteSupplies";
import { Deposit, Supply } from "@types";
import { AutocompleteDeposito } from "../../components/AutocompleteDeposito";
import { TTipoActividadPlanificada } from "../../../../interfaces/planification";

const TypeBadge = styled(Chip)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  fontSize: "0.75rem",
  height: "auto",
  padding: "0 6px",
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
  animation: deleting ? `${flashFadeAnimation} 1s forwards` : "none",
}));

const Title = styled(Typography)({
  fontSize: "1.5em",
  fontWeight: "bold",
  color: "#333",
  marginBottom: "20px",
});

const CustomPaper = styled(Paper)({
  padding: "20px",
  margin: "20px 0",
  backgroundColor: "#f7f7f7",
});

function SuppliesForm({ lot, db, formData, setFormData }) {
  const { t } = useTranslation();
  const [selectedSupply, setSelectedSupply] = useState<Supply>();
  const [dosificacion, setDosificacion] = useState("");
  const [total, setTotal] = useState("");
  const [precio, setPrecio] = useState("");
  const [costoTotal, setCostoTotal] = useState(0);
  const [rows, setRows] = useState([]);
  const [editIndex, setEditIndex] = useState(-1);
  const [deposito, setDeposito] = useState<Deposit>();
  const { isLoading, supplies, getSupplies, setSupplies, deleteSupply } =
    useSupply();
  const { deposits, getDeposits } = useDeposit();
  const [editData, setEditData] = useState({
    selectedOption: "",
    dosificacion: "",
    total: "",
    deposito: {},
    precio: "",
  });

  const findInsumoByOption = (option) => {
    return supplies.find((supply) => supply.name === option);
  };

  const handleAddRow = () => {
    // const supply = findInsumoByOption(selectedSupply);
    const newRow = {
      dosis: dosificacion,
      insumo: selectedSupply,
      motivos: [],
      uuid: uuid4(),
      total: total,
      deposito: deposito,
      precio_estimado: precio,
    };
    const newDetalles = [...formData.detalles.dosis, newRow];
    setFormData({
      ...formData,
      detalles: { ...formData.detalles, dosis: newDetalles },
    });
    console.log("NUEVA FILA", newRow);
    setSelectedSupply("");
    setDosificacion("");
    setTotal("");
    setDeposito("");
    setPrecio("");
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
      deposito: editData.deposito,
      total: editData.total,
      precio_estimado: editData.precio,
    };
    const updatedDetalles = [...formData.detalles.dosis];
    updatedDetalles[editIndex] = updatedRow;
    setFormData({
      ...formData,
      detalles: { ...formData.detalles, dosis: updatedDetalles },
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
    setCostoTotal((+event.target.value * formData.detalles.hectareas * +precio).toFixed(2));

  };

  const handleDepositoChange = (event) => {
    setDeposito(event);
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
        detalles: { ...formData.detalles, dosis: updatedDetalles },
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
      costo_total: (+event.target.value * formData.detalles.hectareas * editData.precio).toFixed(2),
    });
  };

  const handleEditCantidadTotalChange = (event) => {
    setEditData({ ...editData, total: event.target.value ,
      dosificacion: (+event.target.value / formData.detalles.hectareas).toFixed(
        2
      ),
      costo_total: (+event.target.value * editData.precio).toFixed(2),
    });
  };

  const handleEditCostoTotalChange = (event) => {
    setEditData({ ...editData, costo_total: event.target.value ,
      precio: (+editData.total / +event.target.value).toFixed(2),
    });
  };

  const handleEditPrecioUnitarioChange = (event) => {
    setEditData({ ...editData, precio: event.target.value,
      costo_total: (+editData.total / +event.target.value).toFixed(2),
    });
  };

  useEffect(() => {
    getSupplies();
    getDeposits();
  }, []);

  useEffect(() => {
    if (formData && formData.detalles && formData.detalles.dosis) {
      setRows(
        formData.detalles.dosis.map((dosis) => ({
          selectedOption: dosis.insumo,
          dosificacion: dosis.dosis,
          total: dosis.total,
          deposito: dosis.deposito,
          precio: dosis.precio_estimado,
          uuid: dosis.uuid,
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
          {/* Fila 1 */}
          <Grid container item xs={12} spacing={1}>
            <Grid item xs={4}>
              <FormControl fullWidth>
                <AutocompleteSupplies
                  value={selectedSupply}
                  onChange={handleSelectChange}
                />
              </FormControl>
            </Grid>
            <Grid container item xs={8}>
              <Paper sx={{ width: "100%", padding: "5px" }}>
                {selectedSupply?.description && (
                  <Typography variant="body2" gutterBottom>
                    {selectedSupply?.description}
                  </Typography>
                )}
                <Grid item xs={12}>
                  {selectedSupply?.brand && (
                    <Typography variant="subtitle2" gutterBottom>
                      Marca: {selectedSupply?.brand}
                    </Typography>
                  )}
                  {selectedSupply?.activePrincipal && (
                    <Typography variant="body2" gutterBottom>
                      Principio Activo: {selectedSupply?.activePrincipal}
                    </Typography>
                  )}
                  {selectedSupply?.formulationDenomination && (
                    <Typography variant="body2" gutterBottom>
                      Denominación Formulado:{" "}
                      {selectedSupply?.formulationDenomination}
                    </Typography>
                  )}
                  {selectedSupply?.toxicityClass && (
                    <Typography variant="body2" gutterBottom>
                      Clase de Toxicidad: {selectedSupply?.toxicityClass}
                    </Typography>
                  )}
                  {selectedSupply?.chemicalComposition && (
                    <Typography variant="body2" gutterBottom>
                      Composicion Química: {selectedSupply?.chemicalComposition}
                    </Typography>
                  )}
                  {selectedSupply?.productUrl && (
                    <Link
                      href={selectedSupply?.productUrl}
                      target="_blank"
                      variant="body2"
                    >
                      Website del Producto
                    </Link>
                  )}
                  {/* {selectedSupply?._id} */}
                </Grid>
              </Paper>
            </Grid>
          </Grid>

          {/* Fila 2 */}
          <Grid container item xs={12} spacing={1}>
            <Grid item xs={3}>
              <AutocompleteDeposito
                value={deposito}
                onChange={handleDepositoChange}
              />
            </Grid>
            <Grid item xs={2}>
              <NumberFieldWithUnits
                fullWidth
                label={t("_quantity_per_hectare")}
                value={+dosificacion}
                onChange={handleDosificacionChange}
                unit={
                  (selectedSupply && selectedSupply?.unitMeasurement + "/ha") ||
                  "unit/ha"
                }
              />
            </Grid>
            <Grid item xs={2}>
              <NumberFieldWithUnits
                fullWidth
                label={t("_total_quantity")}
                value={+total}
                onChange={handleTotalChange}
                unit={selectedSupply?.unitMeasurement || "unit"}
              />
            </Grid>
            <Grid item xs={2}>
              <NumberFieldWithUnits
                fullWidth
                label={t("_unit_price")}
                value={+precio}
                onChange={handlePrecioChange}
                unit={"USD" + "/" + (selectedSupply?.unitMeasurement || "unit")}
              />
            </Grid>
            <Grid item xs={2}>
              <NumberFieldWithUnits
                fullWidth
                label={t("_total_cost")}
                value={costoTotal}
                onChange={handleCostoTotalChange}
                unit="USD"
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
                      <Grid item xs={12}>
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

                      <Grid item xs={2}>
                        <NumberFieldWithUnits
                          size="small"
                          fullWidth
                          label={t("_quantity_per_hectare")}
                          value={+editData.dosificacion}
                          onChange={handleEditCantidadPorHaChange}
                          unit="unit/ha"
                        />
                      </Grid>
                      <Grid item xs={2}>
                        <NumberFieldWithUnits
                          fullWidth
                          label={t("_total_quantity")}
                          value={+editData.total}
                          onChange={handleEditCantidadTotalChange}
                          unit="ha"
                        />
                      </Grid>
                      <Grid item xs={2}>
                        <NumberFieldWithUnits
                          fullWidth
                          label="Precio Unitario"
                          value={editData.precio}
                          onChange={handleEditPrecioUnitarioChange}
                          type="number"
                          unit={
                            "USD" +
                            "/" +
                            (editData.selectedOption?.unitMeasurement || "unit")
                          }
                        />
                      </Grid>
                      <Grid item xs={2}>
                        <NumberFieldWithUnits
                          fullWidth
                          label="Costo Total"
                          value={editData.costo_total || 0}
                          onChange={handleEditCostoTotalChange}
                          unit={"USD"}
                        />
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
                      <Grid container item xs={10}>
                        <Grid item xs={3}>
                          <Typography variant="caption">
                            <strong> Deposito:</strong>
                            {row.deposito?.description || "Si deposito"}
                          </Typography>
                        </Grid>
                        <Grid item xs={2}>
                          <Typography
                            variant="caption"
                            title={row.selectedOption?.unitMeasurement + "/ha"}
                          >
                            <strong>{t("_quantity_per_hectare")}:</strong>{" "}
                            {row.dosificacion}{" "}
                            {abrUnit(row.selectedOption?.unitMeasurement)}/ha
                          </Typography>
                        </Grid>
                        <Grid item xs={2}>
                          <Typography
                            variant="caption"
                            title={row.selectedOption?.unitMeasurement}
                          >
                            <strong>{t("_total_quantity")}:</strong> {row.total}{" "}
                            {abrUnit(row.selectedOption?.unitMeasurement)}
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography
                            variant="caption"
                            title={"USD/" + row.selectedOption?.unitMeasurement}
                          >
                            <strong>{t("_unit_price")}:</strong> {row.precio}{" "}
                            {abrUnit(
                              "USD/" + row.selectedOption?.unitMeasurement
                            )}
                          </Typography>
                        </Grid>
                        <Grid item xs={2}>
                          <Typography variant="caption">
                            <strong>{t("_total_cost")}:</strong>{" "}
                            {row.precio * row.total} USD
                          </Typography>
                        </Grid>
                      </Grid>
                    </>
                  )}
                  <Grid item xs={2} style={{ textAlign: "right" }}>
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
                          color="secondary"
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
                          color="secondary"
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
