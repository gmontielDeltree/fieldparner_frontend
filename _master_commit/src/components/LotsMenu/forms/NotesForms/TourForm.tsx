import React, { useEffect, useState } from 'react'
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
  ImageList,
} from '@mui/material'
import {
  LocalizationProvider,
  DatePicker,
  TimePicker,
} from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { styled } from '@mui/material/styles'
import { motion, AnimatePresence } from 'framer-motion'
import PointForm from './PointForm'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { AudioPlayer, ImageGrid } from './PointFormStyles'
import { dbContext } from '../../../../services'
import { useTranslation } from 'react-i18next'

const CustomPaper = styled(Paper)({
  padding: '20px',
  margin: '20px 0',
  backgroundColor: '#f7f7f7',
})


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


const Title = styled(Typography)({
  fontSize: '1.5em',
  fontWeight: 'bold',
  color: '#333',
  marginBottom: '20px',
})

const containerVariants = {
  hidden: { opacity: 0, x: '-100vw' },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'tween',
      ease: 'anticipate',
      duration: 0.5,
    },
  },
  exit: {
    opacity: 0,
    x: '100vw',
    transition: {
      type: 'tween',
      ease: 'anticipate',
      duration: 0.5,
    },
  },
}

const FeatureAccordion = styled(Accordion)({
  backgroundColor: '#f0f0f0',
  margin: '10px 0',
})

function TourForm({ lot, formData, setFormData, tourSave, activeStep = 0 }) {
  const { t } = useTranslation()
  const db = dbContext.fields
  const [isPointMode, setIsPointMode] = useState(false)
  const [imageUrls, setImageUrls] = useState({})
  const [audioUrls, setAudioUrls] = useState({})

  useEffect(() => {
    const loadMediaUrls = async () => {
      let newImageUrls = {}
      let newAudioUrls = {}
      for (const feature of formData.features || []) {
        for (const foto of feature.properties.fotos) {
          if (!newImageUrls[foto]) {
            newImageUrls[foto] = await fetchImageUrl(foto)
          }
        }
        for (const audio of feature.properties.audios) {
          if (!newAudioUrls[audio]) {
            newAudioUrls[audio] = await fetchAudioUrl(audio)
          }
        }
      }
      setImageUrls(newImageUrls)
      setAudioUrls(newAudioUrls)
    }

    loadMediaUrls()
  }, [formData.features])

  const fetchImageUrl = async (imageId) => {
    try {
      const blob = await db.getAttachment(imageId, 'image')
      return URL.createObjectURL(blob)
    } catch (error) {
      console.error(t('errorFetchingTourImage'), error)
      return null
    }
  }

  const fetchAudioUrl = async (audioId: string) => {
    try {
      const blob = await db.getAttachment(audioId, 'audio')
      return URL.createObjectURL(blob)
    } catch (error) {
      console.error(t('errorFetchingTourAudio'), error)
      return null
    }
  }

  const onFieldChange = (fieldName, value) => {
    setFormData({
      ...formData,
      [fieldName]: value,
    })
  }

  const handleAddPoint = () => {
    setIsPointMode(true)
  }

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
              alt={t('featureImage', { index: index })}
              loading="lazy"
              style={{ borderRadius: '4px' }}
            />
          </ImageListItem>
        ))}
      </ImageGrid>
      {feature.properties.audios.map((audioId, audioIndex) => (
        <AudioPlayer key={audioIndex} controls src={audioUrls[audioId]} />
      ))}
    </>
  )

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
    ))
  }

  // Function to render content based on active step
  const renderStepContent = () => {
    switch (activeStep) {
      case 0: // General Information
        return (
          <motion.div
            key="generalInfo"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Title>{t('generalInfo')}</Title>
            <FormControl fullWidth>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={12}>
                  <TextField
                    label={t('nameLabel')}
                    fullWidth
                    value={formData.nombre || ''}
                    onChange={(e) => onFieldChange('nombre', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label={t('dateLabel')}
                      value={formData.fecha || null}
                      onChange={(newValue) => {
                        const updatedFormData = { ...formData, fecha: newValue }
                        setFormData(updatedFormData)
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <TimePicker
                      label={t('timeLabel')}
                      value={formData.hora || null}
                      onChange={(newValue) => {
                        const updatedFormData = { ...formData, hora: newValue }
                        setFormData(updatedFormData)
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label={t('nextVisitLabel')}
                      value={formData.proxima_visita || null}
                      onChange={(newValue) => {
                        const updatedFormData = {
                          ...formData,
                          proxima_visita: newValue,
                        }
                        setFormData(updatedFormData)
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
              </Grid>
            </FormControl>
          </motion.div>
        )

      case 1: // Inspection Points
        if (isPointMode) {
          return (
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
          )
        }
        return (
          <motion.div
            key="inspectionPoints"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Title>{t('inspectionPoints')}</Title>
            <Grid item xs={12}>
              <Button
                variant="contained"
                onClick={handleAddPoint}
                style={{ marginTop: '15px' }}
              >
                {t('newPointButton')}
              </Button>
            </Grid>
            {formData.features.length > 0 && (
              <Grid item xs={12} style={{ marginTop: '30px' }}>
                <Typography variant="h6">{t('existingPointsTitle')}</Typography>
                {renderFeatureList()}
              </Grid>
            )}
          </motion.div>
        )

      case 2: // Summary
        return (
          <motion.div
            key="summary"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Title>{t('summaryAndReview')}</Title>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" className="mb-2">
                  {t('generalInfo')}
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary={t('nameLabel')}
                      secondary={formData.nombre || t('notSpecified')}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary={t('dateLabel')}
                      secondary={formData.fecha ? new Date(formData.fecha).toLocaleDateString() : t('notSpecified')}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary={t('timeLabel')}
                      secondary={formData.hora ? new Date(formData.hora).toLocaleTimeString() : t('notSpecified')}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary={t('nextVisitLabel')}
                      secondary={formData.proxima_visita ? new Date(formData.proxima_visita).toLocaleDateString() : t('notSpecified')}
                    />
                  </ListItem>
                </List>
              </Grid>
              {formData.features.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" className="mb-2">
                    {t('inspectionPoints')} ({formData.features.length})
                  </Typography>
                  {renderFeatureList()}
                </Grid>
              )}
            </Grid>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <CustomPaper elevation={3}>
      <AnimatePresence mode="wait">
        {renderStepContent()}
      </AnimatePresence>
    </CustomPaper>
  )
}

export default TourForm