import React, { useEffect, useState } from "react";
import {
  TextField,
  FormControl,
  Grid,
  Paper,
  Typography,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  ImageList,
  ImageListItem,
  List,
  ListItem,
  CardContent,
} from "@mui/material";
import {
  LocalizationProvider,
  DatePicker,
  TimePicker,
} from "@mui/lab";
import { AdapterDateFns } from "@mui/lab/AdapterDateFns";
import { styled } from "@mui/system";
import { motion, AnimatePresence } from "framer-motion";
import PointForm from "./PointForm";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { AudioPlayer } from "./PointFormStyles";
import { dbContext } from "../../../../services";
import { parseISO } from "date-fns";

const CustomPaper = styled(Paper)({
  padding: "20px",
  margin: "20px 0",
  backgroundColor: "#f7f7f7",
});

const Title = styled(Typography)({
  fontSize: "1.5em",
  fontWeight: "bold",
  color: "#333",
  marginBottom: "20px",
});

const containerVariants = {
  hidden: { opacity: 0, x: "-100vw" },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "tween",
      ease: "anticipate",
      duration: 0.5,
    },
  },
  exit: {
    opacity: 0,
    x: "100vw",
    transition: {
      type: "tween",
      ease: "anticipate",
      duration: 0.5,
    },
  },
};

const FeatureAccordion = styled(Accordion)({
  backgroundColor: "#f0f0f0",
  margin: "10px 0",
});

interface FormData {
  nombre: string;
  fecha: Date | null;
  hora: Date | null;
  proxima_visita: Date | null;
}

interface TourFormProps {
  lot: string;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  tourSave: () => void;
}

const TourForm: React.FC<TourFormProps> = ({
  lot,
  formData,
  setFormData,
  tourSave,
}) => {
  const db = dbContext.fields;
  const [isPointMode, setIsPointMode] = useState(false);
  const [imageUrls, setImageUrls] = useState({});
  const [audioUrls, setAudioUrls] = useState({});

  useEffect(() => {
    const loadMediaUrls = async () => {
      let newImageUrls = {};
      let newAudioUrls = {};
      for (const feature of formData.features || []) {
        for (const foto of feature.properties.fotos) {
          if (!newImageUrls[foto]) {
            newImageUrls[foto] = await fetchImageUrl(foto);
          }
        }
        if (
          feature.properties.audio &&
          !newAudioUrls[feature.properties.audio]
        ) {
          newAudioUrls[feature.properties.audio] = await fetchAudioUrl(
            feature.properties.audio
          );
        }
      }
      setImageUrls(newImageUrls);
      setAudioUrls(newAudioUrls);
    };

    loadMediaUrls();
  }, [formData.features]);

  const onFieldChange = (fieldName: keyof FormData, value: any) => {
    setFormData({
      ...formData,
      [fieldName]: value,
    });
  };

  const fetchImageUrl = async (imageId: string) => {
    try {
      const blob = await db.getAttachment(imageId, "image");
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("Error fetching image:", error);
    }
  };

  const fetchAudioUrl = async (audioId: string) => {
    try {
      const blob = await db.getAttachment(audioId, "audio");
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("Error fetching audio:", error);
    }
  };

  const DetailCard = styled(Card)({
    marginBottom: "10px",
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
  });

  const ImageGrid = styled(ImageList)({
    width: "100%",
    transform: "translateZ(0)",
  });

  const renderFeatureDetails = (feature: any) => (
    <>
      <List>
        {feature.properties.detalles.map((detail: any, index: number) => (
          <DetailCard key={index}>
            <CardContent>
              <Typography variant="body1">{detail.name}</Typography>
              <Typography variant="body2" color="textSecondary">
                {detail.value}
              </Typography>
            </CardContent>
          </DetailCard>
        ))}
      </List>
      <ImageGrid cols={3} gap={8}>
        {feature.properties.fotos.map((foto: string, index: number) => (
          <ImageListItem key={index}>
            <img
              src={imageUrls[foto]}
              alt={`feature ${index}`}
              loading="lazy"
              style={{ borderRadius: "4px" }}
            />
          </ImageListItem>
        ))}
      </ImageGrid>
      {feature.properties.audio && audioUrls[feature.properties.audio] && (
        <AudioPlayer controls src={audioUrls[feature.properties.audio]} />
      )}
    </>
  );

  const renderFeatureList = () => {
    return formData.features?.map((feature, index) => (
      <FeatureAccordion key={index}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1">
            {feature.properties.nombre}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>{renderFeatureDetails(feature)}</AccordionDetails>
      </FeatureAccordion>
    ));
  };

  const handleAddPoint = () => {
    setIsPointMode(true);
  };

  const safeParseDate = (dateStr: string) => {
    console.log("Parsing date:", dateStr);
    try {
      if (dateStr) {
        return parseISO(dateStr);
      } else {
        return new Date();
      }
    } catch (e) {
      console.error("Error parsing date:", e);
      return new Date();
    }
  };

  return (
    <CustomPaper elevation={3}>
      <AnimatePresence>
        {!isPointMode ? (
          <motion.div
            key="mainForm"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Title>Nota</Title>
            <FormControl fullWidth>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Fecha"
                      value={formData.fecha || new Date()}
                      onChange={(newValue) => {
                        const updatedFormData = { ...formData, fecha: newValue };
                        setFormData(updatedFormData);
                      }}
                      renderInput={(params) => (
                        <TextField {...params} fullWidth />
                      )}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <TimePicker
                      label="Hora"
                      value={formData.hora !== undefined ? formData.hora : new Date()}
                      onChange={(newValue) => {
                        const updatedFormData = { ...formData, hora: newValue };
                        setFormData(updatedFormData);
                      }}
                      renderInput={(params) => (
                        <TextField {...params} fullWidth />
                      )}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Próxima Visita"
                      value={formData.proxima_visita || new Date()}
                      onChange={(newValue) => {
                        const updatedFormData = { ...formData, proxima_visita: newValue };
                        setFormData(updatedFormData);
                      }}
                      renderInput={(params) => (
                        <TextField {...params} fullWidth />
                      )}
                    />
                  </LocalizationProvider>
                </Grid>
              </Grid>
            </FormControl>
            <Grid item xs={12}>
              <Button
                variant="contained"
                onClick={handleAddPoint}
                style={{ marginTop: "15px" }}
              >
                Nuevo Punto
              </Button>
            </Grid>

            {formData.features.length > 0 ? (
              <Grid item xs={12} style={{ marginTop: "50px" }}>
                <Title>Puntos Existentes</Title>
                {renderFeatureList()}
              </Grid>
            ) : null}
          </motion.div>
        ) : (
          <motion.div
            key="pointForm"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <PointForm
              lot={lot}
              formData={formData}
              setFormData={setFormData}
              setIsPointMode={setIsPointMode}
              onTourSave={tourSave}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </CustomPaper>
  );
};

export default TourForm;
