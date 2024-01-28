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
  IconButton,
  List,
  ListItem,
  ListItemText,
  CardContent,
  ImageListItem,
  Card,
  ImageList
} from "@mui/material";
import {
  LocalizationProvider,
  DatePicker,
  TimePicker
} from "@mui/x-date-pickers";
import PouchDB from "pouchdb";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { styled } from "@mui/material/styles";
import { motion, AnimatePresence } from "framer-motion";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { AudioPlayer } from "./../../../forms/NotesForms/PointFormStyles";

const CustomPaper = styled(Paper)({
  padding: "20px",
  margin: "20px 0",
  backgroundColor: "#f7f7f7"
});

const Title = styled(Typography)({
  fontSize: "1.5em",
  fontWeight: "bold",
  color: "#333",
  marginBottom: "20px"
});

const containerVariants = {
  hidden: { opacity: 0, x: "-100vw" },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "tween",
      ease: "anticipate",
      duration: 0.5
    }
  },
  exit: {
    opacity: 0,
    x: "100vw",
    transition: {
      type: "tween",
      ease: "anticipate",
      duration: 0.5
    }
  }
};

const FeatureAccordion = styled(Accordion)({
  backgroundColor: "#f0f0f0",
  margin: "10px 0"
});

function NotePoints({ activity }) {
  const db = new PouchDB("campos_randyv7");
  const [imageUrls, setImageUrls] = useState({});
  const [audioUrls, setAudioUrls] = useState({});
  const formData = activity;

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

  const fetchImageUrl = async (imageId) => {
    try {
      const blob = await db.getAttachment(imageId, "image");
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("Error fetching image:", error);
    }
  };
  const fetchAudioUrl = async (audioId) => {
    try {
      const blob = await db.getAttachment(audioId, "audio");
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("Error fetching audio:", error);
    }
  };

  const DetailCard = styled(Card)({
    marginBottom: "10px",
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)"
  });

  const ImageGrid = styled(ImageList)({
    width: "100%",
    transform: "translateZ(0)"
  });

  const renderFeatureDetails = (feature) => (
    <>
      <List>
        {feature.properties.detalles.map((detail, index) => (
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
        {feature.properties.fotos.map((foto, index) => (
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

  return (
    <CustomPaper elevation={3}>
      <AnimatePresence mode="wait">
        <motion.div
          key="mainForm"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {formData.features.length > 0 ? (
            <Grid item xs={12} style={{ marginTop: "50px" }}>
              {renderFeatureList()}
            </Grid>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </CustomPaper>
  );
}

export default NotePoints;
