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
import { styled } from "@mui/material/styles";
import { motion, AnimatePresence } from "framer-motion";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { AudioPlayer } from "./../../../forms/NotesForms/PointFormStyles";
import PlaceMarker from "../../../../NewGeometry/PlaceMarker";
import { dbContext } from "../../../../../services";

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
  // Use the same database instance as PointForm
  const db = dbContext.fields;
  const [imageUrls, setImageUrls] = useState({});
  const [audioUrls, setAudioUrls] = useState({});
  const removeMarkerFunctionsRef = useRef([]);
  const formData = activity;

  useEffect(() => {
    const loadMediaUrls = async () => {
      let newImageUrls = {};
      let newAudioUrls = {};
      for (const feature of formData.features || []) {
        for (const foto of feature.properties.fotos) {
          if (!newImageUrls[foto]) {
            try {
              newImageUrls[foto] = await fetchImageUrl(foto);
              console.log(`Successfully loaded image: ${foto}`);
            } catch (error) {
              console.error(`Failed to load image: ${foto}`, error);
            }
          }
        }
        if (
          feature.properties.audio &&
          !newAudioUrls[feature.properties.audio]
        ) {
          try {
            newAudioUrls[feature.properties.audio] = await fetchAudioUrl(
              feature.properties.audio
            );
          } catch (error) {
            console.error(`Failed to load audio: ${feature.properties.audio}`, error);
          }
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
      if (!blob) {
        console.error(`No blob found for image ID: ${imageId}`);
        return null;
      }
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("Error fetching image:", error);
      return null;
    }
  };

  const fetchAudioUrl = async (audioId) => {
    try {
      const blob = await db.getAttachment(audioId, "audio");
      if (!blob) {
        console.error(`No blob found for audio ID: ${audioId}`);
        return null;
      }
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("Error fetching audio:", error);
      return null;
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
            {imageUrls[foto] ? (
              <img
                src={imageUrls[foto]}
                alt={`feature ${index}`}
                loading="lazy"
                style={{ borderRadius: "4px" }}
                onError={(e) => {
                  console.error(`Image failed to load: ${foto}`);
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='%23ccc' d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z'/%3E%3C/svg%3E";
                  e.target.style.backgroundColor = "#f0f0f0";
                }}
              />
            ) : (
              <div
                style={{
                  height: "140px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#f0f0f0",
                  borderRadius: "4px"
                }}
              >
                Loading image...
              </div>
            )}
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