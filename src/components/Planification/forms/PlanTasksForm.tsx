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

return (<Box>
  LOL
</Box>) 
}

export default PlanTasksForm;
