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
import { useAppDispatch, useForm, useSupply } from "../../../../hooks";
import { useAppSelector } from '../../../../hooks/useRedux';
import Chip from "@mui/material/Chip";
import { useDeposit } from "../../../../hooks";
import { useTranslation } from "react-i18next";
import { NumberFieldWithUnits } from "../../components/NumberField";
import { AutocompleteSupplies } from "../../components/AutocompleteSupplies";
import { Deposit, Supply } from "@types";
import { AutocompleteDeposito } from "../../components/AutocompleteDeposito";
import { TTipoActividadPlanificada } from "../../../../interfaces/planification";
import { useBusiness } from "../../../../hooks";
import { AutocompleteContratista } from "../../components/AutocompleteContratista";
import NumbersIcon from "@mui/icons-material/Numbers";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import SummarizeIcon from "@mui/icons-material/Summarize";
import set from "date-fns/esm/set/index";
import { useLaborsServices } from "../../../../hooks/useLaborsServices";


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

function ServicesForm({ formData, setFormData }) {
  const { t } = useTranslation();
  const {
    laborsServices,
    getLaborsServices,
  } = useLaborsServices();

  const [selectedService, setSelectedService] = useState("");
  const [contractor, setContractor] = useState("");
  const [comment, setComment] = useState("");
  const [units, setUnits] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [unitPrice, setUnitPrice] = useState(0);
  const [rows, setRows] = useState([]);
  const [editIndex, setEditIndex] = useState(-1);
  const { isLoading, supplies, getSupplies } = useSupply();
  const [art, setArt] = useState("");
  const { businesses, getBusinesses } = useBusiness();
  const { user } = useAppSelector(state => state.auth);
  const isBrazil = user?.countryId === "BR";
  const isFitosanitaria = formData.detalles.fitosanitaria;

  const services = laborsServices;

  const { getDeposits } = useDeposit();
  const [editData, setEditData] = useState({
    servicio: "",
    contratista: "",
    comentario: "",
    unidades: 0,
    precio: 0,
    costo_total: 0
  });

  useEffect(() => {
    getLaborsServices();
    getBusinesses();
  }, []);

  const handleArtChange = (event) => {
    setArt(event.target.value);
  };
  const handleAddRow = () => {
    const newRow = {
      servicio: selectedService,
      contratista: contractor,
      comentario: comment,
      unidades: units,
      precio_unidad: unitPrice,
      art: isBrazil && isFitosanitaria ? art : undefined,
      costo_total: totalCost
    };
    console.log("NEW ROW", newRow);
    const newDetalles = [...formData.detalles.servicios, newRow];
    setFormData({
      ...formData,
      detalles: { ...formData.detalles, servicios: newDetalles }
    });
    setSelectedService("");
    
    setContractor("");
    setComment("");
    setUnits(0);
    setUnitPrice(0);
    setTotalCost(0);
  };

  const handleSaveEdit = () => {
    if (!editData.servicio) {
      alert("Select a service before saving");
      return;
    }
    const updatedRow = editData;

    const updatedDetalles = [...formData.detalles.servicios];
    updatedDetalles[editIndex] = updatedRow;
    setFormData({
      ...formData,
      detalles: { ...formData.detalles, servicios: updatedDetalles }
    });
    setEditIndex(-1);
  };

  const handleSelectChange = (event) => {
    const serviceName = event.target.value;
    const selectedService = services.find(
      (service) => service.service === serviceName
    );
    setSelectedService(selectedService);
  };

  const handleTotalChange = (event) => {
    setTotalCost((event.target.value * unitPrice).toFixed(2));
  };

  const handleEditRow = (index) => {
    setEditIndex(index);
    console.log("EDITING ROW ", index, ": ", rows[index]);
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
      const updatedDetalles = formData.detalles.servicios.filter(
        (_, idx) => idx !== index
      );
      setFormData({
        ...formData,
        detalles: { ...formData.detalles, servicios: updatedDetalles }
      });
    }, 1000);
  };

  const handleCommentChange = (event) => {
    setComment(event.target.value);
  };

  const handleEditServiceChange = (service) => {
    setEditData({ ...editData, selectedService: service });
  };

  const handleEditDepositoChange = (deposito) => {
    setEditData({ ...editData, deposito: deposito });
  };

  const handleEditCommentChange = (event) => {
    setEditData({ ...editData, comentario: event.target.value });
  };

  const handleEditUnitPriceChange = (event) => {
    setEditData({
      ...editData,
      precio_unidad: event.target.value,
      total_cost: (+editData.costo_total / +event.target.value).toFixed(2)
    });
  };

  const handleEditUnitsChange = (event) => {
    setEditData({
      ...editData,
      unidades: event.target.value,
      costo_total: (+editData.precio_unidad * +event.target.value).toFixed(2)
    });
  };

  const onFieldChange = (field, value) => {
    if (field === "contractor") {
      setContractor(value);
      return;
    }
    setFormData({ ...formData, [field]: value });
  };

  useEffect(() => {
    getSupplies();
    getDeposits();
  }, []);
  useEffect(() => {
    if (units && unitPrice) {
      const computedTotalCost = (units * unitPrice).toFixed(2);
      setTotalCost(computedTotalCost);
    }
  }, [units, unitPrice]);

  useEffect(() => {
    if (formData && formData.detalles && formData.detalles.servicios) {
      console.log("ADDING ROWS", formData.detalles.servicios);
      setRows(
        formData.detalles.servicios.map(
          (servicio: {
            servicio: any;
            contratista: any;
            comentario: string;
            unidades: any;
            precio_unidad: any;
            costo_total: any;
            uuid: any;
          }) => ({
            servicio: servicio.servicio,
            contratista: servicio.contratista,
            comentario: servicio.comentario,
            precio_unidad: servicio.precio_unidad,
            unidades: servicio.unidades,
            costo_total: servicio.costo_total,
            uuid: servicio.uuid
          })
        )
      );
    }
  }, [formData]);

  // print the rows
  useEffect(() => {
    console.log("ROWS", rows);
  }, [rows]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <CustomPaper elevation={3}>
      <Title>Servicios</Title>
      <FormControl fullWidth>
        <Grid container spacing={2}>
          {/* input row */}
          {isBrazil && isFitosanitaria && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ART (Anotação de Responsabilidade Tecnica)"
                variant="outlined"
                value={formData.detalles.art || ""}
                onChange={handleArtChange}
                helperText="Nro de Autorizacion del ministerio de Salud para la aplicación Fitosanitaria"
              />
            </Grid>
          )}
 
          <Grid container item xs={12} spacing={1}>
            <Grid item xs={4}>
              <FormControl fullWidth>
                <InputLabel id="service-dropdown-label">Servicio</InputLabel>
                <Select
                  labelId="service-dropdown-label"
                  id="service-dropdown"
                  value={selectedService ? selectedService.service : ""}
                  label="Servicio"
                  onChange={handleSelectChange}
                >
                  {services.map((service) => (
                    <MenuItem key={service.service} value={service.service}>
                      {service.service}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={3}>
              <AutocompleteContratista
                value={contractor || ""}
                onChange={(value: any) => onFieldChange("contractor", value)}
                width={190}
              />
            </Grid>

            <Grid item xs={3}>
              <TextField
                fullWidth
                label="Comentario"
                variant="outlined"
                value={comment}
                onChange={handleCommentChange}
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
          <Grid container item xs={12} spacing={1} alignItems="flex-end">
            {/* unidades */}
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Unidades"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <IconButton>
                      <NumbersIcon />
                    </IconButton>
                  )
                }}
              />
            </Grid>

            {/* valor unidad */}
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Valor Unidad"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <IconButton>
                      <AttachMoneyIcon />
                    </IconButton>
                  )
                }}
              />
            </Grid>

            {/* valor total servicio */}
            <Grid item xs={3}>
              <TextField
                fullWidth
                label="Valor Total Servicio"
                value={totalCost}
                InputProps={{
                  readOnly: true, // Makes the field not editable
                  endAdornment: (
                    <IconButton>
                      <SummarizeIcon />
                    </IconButton>
                  )
                }}
              />
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
                        <Grid item xs={4}>
                          <Select
                            labelId="service-dropdown-label"
                            id="service-dropdown"
                            value={editData.servicio.service}
                            label="Servicio"
                            onChange={handleEditServiceChange}
                            width={"100%"}
                          >
                            {services.map((service) => (
                              <MenuItem key={service.service} value={service.service}>
                                {service.service}
                              </MenuItem>
                            ))}
                          </Select>
                        </Grid>
                        <Grid item xs={4}>
                          <AutocompleteContratista
                            value={editData.contratista}
                            onChange={handleEditDepositoChange}
                            width={"100%"}
                          />
                        </Grid>
                        <Grid item xs={3}>
                          <TextField
                            fullWidth
                            label="Comentario"
                            variant="outlined"
                            value={editData.comentario}
                            onChange={handleEditCommentChange}
                          />
                        </Grid>

                      </Grid>
                      <Grid container item xs={12} spacing={1}>
                        <Grid item xs={4}>
                          <NumberFieldWithUnits
                            fullWidth
                            label="Unidades"
                            value={editData.unidades}
                            onChange={handleEditUnitsChange}
                            type="number"
                            unit={"unit"}
                          />
                        </Grid>

                        {/* valor unidad */}
                        <Grid item xs={4}>
                          <NumberFieldWithUnits
                            fullWidth
                            label="Precio Unidad"
                            value={editData.precio_unidad}
                            onChange={handleEditUnitPriceChange}
                            type="number"
                            unit={"USD/unit"}
                          />
                        </Grid>
                      </Grid>
                    </>
                  ) : (
                    <>
                      <Grid container item xs={12}>
                      {isBrazil && isFitosanitaria && (
  <Grid item xs={12}>
    <Typography variant="subtitle2">
      <strong>ART:</strong> {row.art}
    </Typography>
  </Grid>
)}
                        {" "}
                        <Grid item xs={12}>
                          <Typography variant="subtitle1">
                            {row.servicio.service}
                          </Typography>
                        </Grid>
                      </Grid>
                      <Grid container item xs={12}>
                        <Grid item xs={4}>
                          <Typography variant="subtitle2">
                            <strong>{t("contratista")}:</strong>{" "}
                            {row.contratista.razonSocial}{" "}
                          </Typography>
                        </Grid>

                        <Grid item xs={4}>
                          <Typography variant="subtitle2">
                            <strong>{t("comentario")}:</strong> {row.comentario}
                          </Typography>
                        </Grid>
                      </Grid>
                      <Grid container item xs={10}>
                        <Grid item xs={2}>
                          <Typography variant="caption" title={"?"}>
                            <strong>{t("_total_quantity")}:</strong>{" "}
                            {row.unidades}{" "}
                            {/* {abrUnit(row.selectedOption?.unitMeasurement)} */}
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="caption" title={"USD/"}>
                            <strong>{t("_unit_price")}:</strong>{" "}
                            {row.precio_unidad} {abrUnit("USD")}
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="caption">
                            <strong>{t("_total_cost")}:</strong>{" "}
                            {row.precio_unidad * row.unidades} USD
                          </Typography>
                        </Grid>
                      </Grid>
                    </>
                  )}
                  <Grid item xs={1} style={{ textAlign: "right" }}>
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
export default ServicesForm;
