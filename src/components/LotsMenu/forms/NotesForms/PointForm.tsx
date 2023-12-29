import React, { useState, useRef, useEffect } from "react";
import {
  TextField,
  FormControl,
  Grid,
  Typography,
  Button,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  CardActionArea,
  CardContent,
  Card,
  CardMedia
} from "@mui/material";
import { PhotoCamera, Mic, Stop, Delete } from "@mui/icons-material";
import PouchDB from "pouchdb";
import { v4 as uuidv4 } from "uuid";
import { keyframes, styled } from "@mui/material/styles";

const Title = styled(Typography)({
  fontSize: "1.5em",
  fontWeight: "bold",
  color: "#333",
  marginBottom: "20px"
});

const hoverAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const ImageUploadButton = styled(Button)({
  backgroundColor: "#9c27b0",
  color: "#fff",
  "&:hover": {
    backgroundColor: "#7b1fa2",
    animation: `${hoverAnimation} 1.5s ease-in-out infinite`
  },
  margin: "10px 0",
  padding: "10px 20px"
});
const ImageCard = styled(Card)({
  maxWidth: 150,
  margin: "10px",
  position: "relative"
});

const RecordingButton = styled(IconButton)({
  color: (props) => (props.recording ? "#d32f2f" : "#1976d2"),
  transform: (props) => (props.recording ? "scale(1.2)" : "scale(1)"),
  transition: "transform 0.2s ease-in-out",
  "&:hover": {
    backgroundColor: (props) => (props.recording ? "#ff7961" : "#64b5f6")
  }
});

function PointForm({ formData, setFormData, setIsPointMode }) {
  const db = new PouchDB("campos_randyv7");
  const [point, setPoint] = useState({
    properties: { nombre: "", notas: "", detalles: [], fotos: [], audio: "" }
  });
  const [selectedField, setSelectedField] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const audioRef = useRef();
  const [imageUrls, setImageUrls] = useState([]);

  const fieldOptions = ["Muestra #", "Plaga", "Enfermedad", "Anomalia"];

  const onFieldChange = (fieldName, value) => {
    setFormData({
      ...formData,
      [fieldName]: value
    });
  };

  const handlePointChange = (field, value) => {
    setPoint({ ...point, properties: { ...point.properties, [field]: value } });
  };

  const handleAddField = () => {
    if (selectedField) {
      const newDetalles = [
        ...point.properties.detalles,
        { name: selectedField, value: "" }
      ];
      setPoint({
        ...point,
        properties: { ...point.properties, detalles: newDetalles }
      });
      setSelectedField(""); // Reset the dropdown
    }
  };

  // useEffect to consle.log point when point changes
  useEffect(() => {
    console.log("point", point);
  }, [point]);

  const handleDetailChange = (index, value) => {
    const newDetalles = [...point.properties.detalles];
    newDetalles[index].value = value;
    setPoint({
      ...point,
      properties: { ...point.properties, detalles: newDetalles }
    });
  };

  const handleSavePoint = () => {
    const newFeatures = [...(formData.features || []), point];
    setFormData({ ...formData, features: newFeatures });
    setIsPointMode(false);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageId = uuidv4();
      await db.putAttachment(imageId, "image", file, file.type);
      setPoint({
        ...point,
        properties: {
          ...point.properties,
          fotos: [...point.properties.fotos, imageId]
        }
      });
    }
  };

  const fetchImageUrl = async (imageId) => {
    try {
      const blob = await db.getAttachment(imageId, "image");
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("Error fetching image:", error);
    }
  };

  useEffect(() => {
    point.properties.fotos.forEach(async (imageId) => {
      const imageUrl = await fetchImageUrl(imageId);
      setImageUrls((prev) => [...prev, imageUrl]);
    });
  }, [point.properties.fotos]);

  const handleImageRemove = (imageId) => {
    // todo
  };
  const startRecording = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = async (e) => {
        const audioId = uuidv4();
        await db.putAttachment(audioId, "audio", e.data, e.data.type);
        setPoint({
          ...point,
          properties: {
            ...point.properties,
            audio: audioId
          }
        });
      };
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  return (
    <>
      <Title>Nuevo Punto</Title>
      <FormControl fullWidth>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Nombre del Punto"
              fullWidth
              value={point.properties.nombre}
              onChange={(e) => handlePointChange("nombre", e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Nota"
              fullWidth
              value={point.properties.notas}
              onChange={(e) => handlePointChange("notas", e.target.value)}
            />
          </Grid>
          {point.properties.detalles.map((detalle, index) => (
            <Grid item xs={12} key={index}>
              <TextField
                label={detalle.name}
                fullWidth
                value={detalle.value}
                onChange={(e) => handleDetailChange(index, e.target.value)}
              />
            </Grid>
          ))}
          {/* Dropdown for new field */}
          <Grid item xs={12} sm={6}>
            <InputLabel id="field-selector-label">Agregar Campo</InputLabel>
            <Select
              labelId="field-selector-label"
              value={selectedField}
              onChange={(e) => setSelectedField(e.target.value)}
              fullWidth
            >
              {fieldOptions.map((option, index) => (
                <MenuItem key={index} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              variant="contained"
              onClick={handleAddField}
              disabled={!selectedField}
            >
              Agregar Campo
            </Button>
          </Grid>
          {/* Animated Image Upload */}
          <Grid item xs={12}>
            <input
              accept="image/*"
              style={{ display: "none" }}
              id="raised-button-file"
              multiple
              type="file"
              onChange={handleImageUpload}
            />
            <label htmlFor="raised-button-file">
              <ImageUploadButton
                variant="contained"
                component="span"
                startIcon={<PhotoCamera />}
              >
                Subir Imagen
              </ImageUploadButton>
            </label>
          </Grid>

          {/* Display Uploaded Images */}
          <Grid container spacing={2}>
            {imageUrls.map((url, index) => (
              <Grid item key={index}>
                <ImageCard>
                  <CardMedia
                    component="img"
                    height="140"
                    image={url}
                    alt="Uploaded Image"
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleImageRemove(index)}
                    style={{ position: "absolute", top: 0, right: 0 }}
                  >
                    <Delete />
                  </IconButton>
                </ImageCard>
              </Grid>
            ))}
          </Grid>

          {/* Interactive Audio Recording */}
          <Grid item xs={12}>
            <RecordingButton
              recording={isRecording}
              onClick={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? <Stop /> : <Mic />}
            </RecordingButton>
          </Grid>

          {/* Save Button */}
          <Grid item xs={12}>
            <Button variant="contained" onClick={handleSavePoint}>
              Guardar Punto
            </Button>
          </Grid>
        </Grid>
      </FormControl>
    </>
  );
}

export default PointForm;
