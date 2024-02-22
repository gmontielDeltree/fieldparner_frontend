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
  Paper
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
  const [selectedOption, setSelectedOption] = useState("test");
  const [dosificacion, setDosificacion] = useState("");
  const [total, setTotal] = useState("");
  const [precio, setPrecio] = useState("");
  const [rows, setRows] = useState([]);
  const [editIndex, setEditIndex] = useState(-1);
  const [deposito, setDeposito] = useState({});
  const { isLoading, supplies, getSupplies, setSupplies, deleteSupply } =
    useSupply();
  const { deposits, getDeposits } = useDeposit();
  const [editData, setEditData] = useState({
    selectedOption: "",
    dosificacion: "",
    total: "",
    deposito: {},
    precio: ""
  });

  const findInsumoByOption = (option) => {
    return supplies.find((supply) => supply.name === option);
  };

  const handleAddRow = () => {
    const supply = findInsumoByOption(selectedOption);
    const newRow = {
      dosis: dosificacion,
      insumo: supply,
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
    setSelectedOption("");
    setDosificacion("");
    setTotal("");
    setDeposito("");
    setPrecio("");
  };

  const handleSaveEdit = () => {
    const supply = findInsumoByOption(editData.selectedOption);
    const updatedRow = {
      dosis: editData.dosificacion,
      insumo: supply,
      motivos: [],
      uuid: rows[editIndex].uuid,
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
    setSelectedOption(event.target.value);
  };

  const handleDosificacionChange = (event) => {
    setDosificacion(event.target.value);
  };

  const handleDepositoChange = (event) => {
    setDeposito(event.target.value);
  };

  const handleTotalChange = (event) => {
    setTotal(event.target.value);
  };

  const handlePrecioChange = (event) => {
    setPrecio(event.target.value);
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

  useEffect(() => {
    getSupplies();
    getDeposits();
  }, []);

  useEffect(() => {
    console.log("supplies:", supplies);
  }, [supplies]);

  useEffect(() => {
    console.log("deposits:", deposits);
  }, [deposits]);

  useEffect(() => {
    console.log("EDIT DATA:", editData);
  }, [editData]);

  useEffect(() => {
    if (formData && formData.detalles && formData.detalles.dosis) {
      setRows(
        formData.detalles.dosis.map((dosis) => ({
          selectedOption: dosis.insumo.name,
          dosificacion: dosis.dosis,
          total: dosis.total,
          deposito: dosis.deposito,
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
          <Grid item xs={3}>
            <FormControl fullWidth>
              <InputLabel id="select-input-label">Insumos</InputLabel>
              <Select
                labelId="select-input-label"
                id="select-input"
                value={selectedOption}
                label="Supplies"
                onChange={handleSelectChange}
                fullWidth
                renderValue={(selected) => {
                  const selectedSupply = supplies.find(
                    (supply) => supply.name === selected
                  );
                  return (
                    <div>
                      {selected}
                      {selectedSupply && (
                        <TypeBadge
                          label={selectedSupply.type}
                          color="primary"
                        />
                      )}
                    </div>
                  );
                }}
              >
                {supplies.map((supply, index) => (
                  <MenuItem key={index} value={supply.name}>
                    {supply.name}
                    <TypeBadge label={supply.type} color="primary" />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={2.5}>
            <FormControl fullWidth>
              <InputLabel id="deposit-select-label">Deposito</InputLabel>
              <Select
                labelId="deposit-select-label"
                id="deposit-select"
                value={deposito}
                onChange={handleDepositoChange}
                fullWidth
              >
                {deposits.map((deposit, index) => (
                  <MenuItem key={index} value={deposit._id}>
                    {deposit.description}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={2}>
            <TextField
              fullWidth
              label="Dosificación"
              value={dosificacion}
              onChange={handleDosificacionChange}
              type="number"
            />
          </Grid>
          <Grid item xs={1.5}>
            <TextField
              fullWidth
              label="Total"
              value={total}
              onChange={handleTotalChange}
              type="number"
            />
          </Grid>
          <Grid item xs={2}>
            <TextField
              fullWidth
              label="Precio"
              value={precio}
              onChange={handlePrecioChange}
              type="number"
            />
          </Grid>
          <Grid item xs={1}>
            <IconButton onClick={handleAddRow} color="primary" aria-label="add">
              <AddIcon />
            </IconButton>
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
                      <Grid item xs={3}>
                        <TextField
                          fullWidth
                          select
                          label="Insumos"
                          value={editData.selectedOption}
                          onChange={handleEditChange("selectedOption")}
                        >
                          {supplies.map((supply, idx) => (
                            <MenuItem key={idx} value={supply.name}>
                              {supply.name || "No Name"}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={2}>
                        <FormControl fullWidth>
                          <InputLabel id="deposit-select-label">
                            Deposito
                          </InputLabel>
                          <TextField
                            fullWidth
                            select
                            label="Deposito"
                            id="deposit-select"
                            value={editData.deposito}
                            onChange={handleEditChange("deposito")}
                          >
                            {deposits.map((deposit, idx) => (
                              <MenuItem key={idx} value={deposit._id}>
                                {deposit.description || "No Name"}
                              </MenuItem>
                            ))}
                          </TextField>
                        </FormControl>
                      </Grid>

                      <Grid item xs={3}>
                        <TextField
                          fullWidth
                          label="Dosificación"
                          value={editData.dosificacion}
                          onChange={handleEditChange("dosificacion")}
                          type="number"
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <TextField
                          fullWidth
                          label="Total"
                          value={editData.total}
                          onChange={handleEditChange("total")}
                          type="number"
                        />
                      </Grid>
                      <Grid item xs={2}>
                        <TextField
                          fullWidth
                          label="Precio"
                          value={editData.precio}
                          onChange={handleEditChange("precio")}
                          type="number"
                        />
                      </Grid>
                    </>
                  ) : (
                    <>
                      <Grid item xs={12}>
                        <Typography variant="subtitle1">
                          {row.selectedOption}
                        </Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="subtitle1">
                          <strong> Deposito:</strong>{" "}
                          {deposits.find(
                            (deposit) => deposit._id === row.deposito
                          )?.description || "Deposit Not Found"}
                        </Typography>
                      </Grid>
                      <Grid item xs={2.5}>
                        <Typography variant="subtitle1">
                          <strong> Dosificación:</strong> {row.dosificacion}
                        </Typography>
                      </Grid>
                      <Grid item xs={1.5}>
                        <Typography variant="subtitle1">
                          <strong> Total:</strong> {row.total}
                        </Typography>
                      </Grid>
                      <Grid item xs={2}>
                        <Typography variant="subtitle1">
                          <strong> Precio:</strong> {row.precio}
                        </Typography>
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

export default SuppliesForm;
