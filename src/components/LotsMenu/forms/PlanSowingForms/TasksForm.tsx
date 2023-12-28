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

function TasksForm({ lot, formData, setFormData }) {
  const [selectedOption, setSelectedOption] = useState("");
  const [comment, setComment] = useState("");
  const [price, setPrice] = useState("");
  const [editIndex, setEditIndex] = useState(-1);
  const [editData, setEditData] = useState({
    labor: {},
    costo: "",
    observacion: ""
  });

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
    setSelectedOption(event.target.value);
  };

  const handleCommentChange = (event) => {
    setComment(event.target.value);
  };

  const handlePriceChange = (event) => {
    setPrice(event.target.value);
  };

  const handleEditRow = (index) => {
    const editingRow = formData.detalles.costo_labor[index];
    setEditIndex(index);
    setEditData({
      selectedOption: editingRow.labor.uuid,
      price: editingRow.costo.toString(),
      comment: editingRow.observacion
    });
  };

  const handleCancelEdit = () => {
    setEditIndex(-1);
  };

  const handleAddRow = () => {
    const newCostoLabor = {
      labor: tasksList.find((task) => task.uuid === selectedOption),
      costo: Number(price),
      observacion: comment,
      uuid: uuid4()
    };
    setFormData({
      ...formData,
      detalles: {
        ...formData.detalles,
        costo_labor: [...formData.detalles.costo_labor, newCostoLabor]
      }
    });
    setSelectedOption("");
    setComment("");
    setPrice("");
  };

  const handleEditChange = (prop) => (event) => {
    setEditData({ ...editData, [prop]: event.target.value });
  };

  const handleSaveEdit = () => {
    const updatedCostoLabor = [...formData.detalles.costo_labor];
    updatedCostoLabor[editIndex] = {
      ...updatedCostoLabor[editIndex],
      labor: tasksList.find((task) => task.uuid === editData.selectedOption),
      costo: Number(editData.price),
      observacion: editData.comment
    };
    setFormData({
      ...formData,
      detalles: {
        ...formData.detalles,
        costo_labor: updatedCostoLabor
      }
    });
    setEditIndex(-1);
  };

  const handleDeleteRow = (index) => {
    const updatedCostoLabor = formData.detalles.costo_labor.filter(
      (_, idx) => idx !== index
    );
    setFormData({
      ...formData,
      detalles: {
        ...formData.detalles,
        costo_labor: updatedCostoLabor
      }
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
              value={selectedOption}
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
              value={price}
              onChange={handlePriceChange}
              type="number"
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Comentario"
              value={comment}
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
          {formData.detalles.costo_labor.map((row, index) => (
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
                          value={editData.selectedOption}
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
                          value={editData.price}
                          onChange={handleEditChange("price")}
                          type="number"
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <TextField
                          fullWidth
                          label="Comentario"
                          value={editData.comment}
                          onChange={handleEditChange("comment")}
                        />
                      </Grid>
                    </>
                  ) : (
                    <>
                      <Grid item xs={4}>
                        <Typography variant="subtitle1">
                          <strong>Labor:</strong> {row.labor.labor}
                        </Typography>
                      </Grid>
                      <Grid item xs={2}>
                        <Typography variant="subtitle1">
                          <AttachMoneyIcon /> {row.costo}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="subtitle1">
                          <CommentIcon /> {row.observacion}
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

export default TasksForm;
