import React, { useEffect, useRef, useState } from "react";
import {
  Grid,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  CardContent,
  ImageListItem,
  Card,
  ImageList
} from "@mui/material";
import PouchDB from "pouchdb";
import { styled } from "@mui/material/styles";
import { motion, AnimatePresence } from "framer-motion";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { AudioPlayer } from "./../../../forms/NotesForms/PointFormStyles";
import PlaceMarker from "../../../../NewGeometry/PlaceMarker";

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
  backgroundColor: "rgba(255, 255, 255, 0.4)",
  backdropFilter: "blur(10px)",
  margin: "10px 0",
  borderRadius: "10px",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  transition: "all 0.3s ease-in-out",

  "&:before": {
    display: "none"
  },

  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    boxShadow: "0 6px 10px rgba(0, 0, 0, 0.15)"
  }
});

function NotePoints({ activity }) {
  const db = new PouchDB("campos_randyv7");
  const [imageUrls, setImageUrls] = useState({});
  const [audioUrls, setAudioUrls] = useState({});
  const removeMarkerFunctionsRef = useRef<(() => void)[]>([]);
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

  useEffect(() => {
    return () => {
      removeMarkerFunctionsRef.current.forEach((func) => func());
    };
  }, []);

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

  const handleSetCoordinates = (index, newPosition) => {
    console.log("handleSetCoordinates", index, newPosition);
  };

  const DetailCard = styled(Card)({
    position: "relative",
    marginBottom: "10px",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
    borderRadius: "8px",
    overflow: "hidden",
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    padding: "10px",
    "&:before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage:
        "linear-gradient(to top right, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.2))",
      borderRadius: "8px"
    }
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
    <>
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
      {formData.features.map((feature, index) => (
        <PlaceMarker
          key={index}
          selectedLot={{
            geometry: {
              type: "Point",
              coordinates: feature.properties.posicion
            }
          }}
          setCoordinates={(newPosition) =>
            handleSetCoordinates(index, newPosition)
          }
          isDraggable={false}
          onRemoveMarkers={(removeFunc) => {
            removeMarkerFunctionsRef.current.push(removeFunc);
          }}
        />
      ))}
    </>
  );
}

export default NotePoints;
