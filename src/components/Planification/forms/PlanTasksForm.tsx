import React, { useState, useEffect } from "react";
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
import CommentIcon from "@mui/icons-material/Comment";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import { styled, keyframes } from "@mui/material/styles";
import uuid4 from "uuid4";
import { IActividadPlanificacion, ILaboresPlanificacion } from "../../../interfaces/planification";
import { uuidv7 } from "uuidv7";

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

function PlanTasksForm({ formData, setFormData } :  {formData : IActividadPlanificacion,setFormData : (a : IActividadPlanificacion)=>void}) {
  const [selectedLaborId, setSelectedLaborId] = useState("");
  const [costoPorHectarea, setCostoPorHectarea] = useState(0);
  const [comentario, setComentario] = useState("");
  const [editIndex, setEditIndex] = useState(-1);
  const [editData, setEditData] = useState<ILaboresPlanificacion>();

  const tasksList = [
    { labor: "Siembra", uuid: "1" },
    { labor: "Cosecha", uuid: "3" },
    { labor: "Aplicación Aerea", uuid: "4" },
    { labor: "Aplicación Terrestre", uuid: "5" },
    { labor: "Cincel", uuid: "6" },
    { labor: "Disco", uuid: "7" },
    { labor: "Fertilización al Voleo", uuid: "8" },
    { labor: "Riego", uuid: "9" }
  ];

  const handleSelectChange = (event) => {
    setSelectedLaborId(event.target.value);
  };

  const handleCommentChange = (event) => {
    setComentario(event.target.value);
  };

  const handlePriceChange = (event) => {
    setCostoPorHectarea(event.target.value);
  };

  const handleEditRow = (index : number) => {
    const editingRow = formData.labores[index];
    setEditIndex(index);
    setEditData(formData.labores[index]);
  }

  const handleCancelEdit = () => {
    setEditIndex(-1);
  }

  const handleAddRow = () => {
    const newCostoLabor : ILaboresPlanificacion= {
      laborId: selectedLaborId,
      costoPorHectarea: Number(costoPorHectarea),
      comentario: comentario,
      uuid: uuidv7(),
      hectareas : formData.area,
      totalCosto : formData.area * costoPorHectarea,

    };
    setFormData({
      ...formData,
      labores: [
        ...formData.labores,
         newCostoLabor
      ]
    });
    setSelectedLaborId("");
    setComentario("")
    setCostoPorHectarea(0)


  };

  const handleEditChange = (prop) => (event) => {
    setEditData({ ...editData, [prop]: event.target.value });
  };

  const handleSaveEdit = () => {
    const updatedCostoLabor = [...formData.labores];

    updatedCostoLabor[editIndex] = {...editData};

    setFormData({
      ...formData,
      labores: [
        ...updatedCostoLabor
      ]
    });
    setEditIndex(-1);
  };

  const handleDeleteRow = (index : number) => {
    const updatedCostoLabor = formData.labores.filter(
      (_, idx) => idx !== index
    );
    setFormData({
      ...formData,
      labores: [
        ...formData.labores
      ]
    });
  };

  return (
    <CustomPaper elevation={3}>
      <Title>Labores</Title>
      <FormControl fullWidth>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <InputLabel id="select-input-label">Labores</InputLabel>
            <Select
              labelId="select-input-label"
              id="select-input"
              value={selectedLaborId}
              label="Labores"
              onChange={handleSelectChange}
              fullWidth
            >
              {tasksList.map((item, index) => (
                <MenuItem key={index} value={item.uuid} id={item.uuid}>
                  {item.labor}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item xs={3}>
            <TextField
              fullWidth
              label="Costo (USD$)"
              value={costoPorHectarea}
              onChange={handlePriceChange}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Comentario"
              value={comentario}
              onChange={handleCommentChange}
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
        <Typography variant="h6">Labores agregados</Typography>
        <List>
          {formData.labores.map((row, index) => (
            <CustomListItem key={row.uuid} deleting={row.deleting}>
              <CardContent>
                <Grid container alignItems="center" spacing={2}>
                  {editIndex === index ? (
                    <>
                      <Grid item xs={4}>
                        <TextField
                          fullWidth
                          select
                          label="Labor"
                          value={editData?.uuid}
                          onChange={handleEditChange("selectedOption")}
                        >
                          {tasksList.map((task, idx) => (
                            <MenuItem key={task.uuid} value={task.uuid}>
                              {task.labor}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={2}>
                        <TextField
                          fullWidth
                          label="Costo (USD$)"
                          value={editData?.costoPorHectarea}
                          onChange={handleEditChange("price")}
                          type="number"
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <TextField
                          fullWidth
                          label="Comentario"
                          value={editData?.comentario}
                          onChange={handleEditChange("comment")}
                        />
                      </Grid>
                    </>
                  ) : (
                    <>
                      <Grid item xs={4}>
                        <Typography variant="subtitle1">
                          <strong>Labor:</strong> {row.laborId}
                        </Typography>
                      </Grid>
                      <Grid item xs={2}>
                        <Typography variant="subtitle1">
                          <AttachMoneyIcon /> {row.costoPorHectarea}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="subtitle1">
                          <CommentIcon /> {row.comentario}
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

export default PlanTasksForm;
