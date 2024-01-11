import React, { useState, useRef, useEffect } from "react";
import {
  FormControl,
  Select,
  MenuItem,
  CardMedia,
  Grid,
  InputLabel,
  TextField,
  Button,
  IconButton
} from "@mui/material";
import { PhotoCamera, Mic, Stop, Delete } from "@mui/icons-material";
import PouchDB from "pouchdb";
import { v4 as uuidv4 } from "uuid";
import {
  Title,
  ImageUploadButton,
  RecordingButton,
  StyledTextField,
  StyledGrid,
  ImageGrid,
  StyledImageCard,
  CustomButton,
  AudioRecordCard,
  AudioPlaybackCard,
  RecordingIndicator,
  RecordingStatusLabel,
  AudioPlayer,
  PlaybackTitle,
  RecordingArea
} from "./PointFormStyles";
import PlaceMarker from "../../../NewGeometry/PlaceMarker";
import { set } from "date-fns";

function PointForm({ lot, formData, setFormData, setIsPointMode, onTourSave }) {
  const db = new PouchDB("campos_randyv7");
  const [point, setPoint] = useState({
    properties: {
      nombre: "",
      notas: "",
      detalles: [],
      fotos: [],
      audio: "",
      posicion: []
    }
  });
  const [selectedField, setSelectedField] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);
  const [audioUrl, setAudioUrl] = useState(null);
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);

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
      setSelectedField("");
    }
  };

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

  useEffect(() => {
    const fetchImages = async () => {
      const urls = await Promise.all(
        point.properties.fotos.map(async (imageId) => {
          return await fetchImageUrl(imageId);
        })
      );
      setImageUrls(urls);
    };

    if (point.properties.fotos.length > 0) {
      fetchImages();
    }
  }, [point.properties.fotos]);

  const fetchImageUrl = async (imageId) => {
    try {
      const blob = await db.getAttachment(imageId, "image");
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("Error fetching image:", error);
      return null;
    }
  };

  const handleImageRemove = async (imageIndex) => {
    const updatedFotos = [...point.properties.fotos];
    const removedImageId = updatedFotos.splice(imageIndex, 1)[0];
    try {
      await db.removeAttachment(point._id, removedImageId);
    } catch (error) {
      console.error("Error removing image:", error);
    }
    setPoint({
      ...point,
      properties: {
        ...point.properties,
        fotos: updatedFotos
      }
    });

    const updatedImageUrls = [...imageUrls];
    updatedImageUrls.splice(imageIndex, 1);
    setImageUrls(updatedImageUrls);
  };

  const handleAudioRemove = async () => {
    try {
      const audioId = point.properties.audio;
      if (audioId) {
        const doc = await db.get(point._id);
        await db.removeAttachment(point._id, audioId, doc._rev);

        setPoint((prevPoint) => ({
          ...prevPoint,
          properties: {
            ...prevPoint.properties,
            audio: ""
          }
        }));
        setAudioUrl(null);
      }
    } catch (error) {
      console.error("Error removing audio:", error);
    }
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

        const audioBlob = new Blob([e.data], { type: "audio/mp3" });
        setAudioUrl(URL.createObjectURL(audioBlob));
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
  const [markerSaved, setMarkerSaved] = useState(false);

  const handleSaveMarker = () => {
    console.log(" COORDINATES: ", coordinates);
    setPoint({
      ...point,
      properties: {
        ...point.properties,
        posicion: coordinates
      }
    });
    setMarkerSaved(true);
  };

  const formStyle = {
    opacity: markerSaved ? 1 : 0.5,
    filter: markerSaved ? "none" : "blur(3px)"
  };

  const markerMessageStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    textAlign: "center",
    zIndex: 2
  };

  return (
    <>
      <Title>Nuevo Punto</Title>
      {!markerSaved && (
        <div style={markerMessageStyle}>
          <h4>Coloca el marcador</h4>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveMarker}
          >
            Guardar
          </Button>
        </div>
      )}
      <PlaceMarker
        selectedLot={lot}
        setCoordinates={setCoordinates}
        isDraggable={!markerSaved}
        onRemoveMarkers={onTourSave}
      />

      <div style={formStyle}>
        <FormControl fullWidth>
          <StyledGrid container spacing={2}>
            <Grid item xs={12}>
              <StyledTextField
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
              <InputLabel id="field-selector-label"></InputLabel>
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
            <ImageGrid container>
              {imageUrls.map((url, index) => (
                <StyledImageCard key={index}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={url}
                    alt="Uploaded Image"
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleImageRemove(index)}
                    style={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      color: "red"
                    }}
                  >
                    <Delete />
                  </IconButton>
                </StyledImageCard>
              ))}
            </ImageGrid>

            {/* Audio Recording Section */}
            <RecordingArea>
              <AudioRecordCard>
                <RecordingIndicator recording={isRecording} />
                <RecordingStatusLabel>
                  {isRecording ? "Grabando..." : "Listo para grabar"}
                </RecordingStatusLabel>
                <RecordingButton
                  recording={isRecording}
                  onClick={isRecording ? stopRecording : startRecording}
                >
                  {isRecording ? <Stop /> : <Mic />}
                </RecordingButton>
              </AudioRecordCard>
            </RecordingArea>

            {/* Display Recorded Audio */}
            {audioUrl && (
              <AudioPlaybackCard>
                <PlaybackTitle>Audio Grabado</PlaybackTitle>
                <AudioPlayer controls src={audioUrl} />
                <IconButton
                  onClick={handleAudioRemove}
                  style={{ color: "red", marginTop: "10px" }}
                >
                  <Delete />
                </IconButton>
              </AudioPlaybackCard>
            )}

            {/* Save Button */}
            <StyledGrid item xs={12}>
              <CustomButton variant="contained" onClick={handleSavePoint}>
                Guardar Punto
              </CustomButton>
            </StyledGrid>
          </StyledGrid>
        </FormControl>
      </div>
    </>
  );
}

export default PointForm;
