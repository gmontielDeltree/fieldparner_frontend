import React, { useState } from "react";
import {
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Tab,
  Tabs
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

const GroundSampleDetails = ({
  activity,
  complementaryColor,
  handleDeleteActivity,
  handleEditActivity,
  handleDownloadPDF,
  handleConfirmExecution,
  handleReplicateActivity,
  lotDoc,
  fieldName
}) => {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const formattedDate = activity.fecha
    ? format(parseISO(activity.fecha), "PPPP", { locale: es })
    : "Fecha no definida";

  return (
    <Box sx={{ padding: "20px" }}>
      <Paper
        elevation={3}
        sx={{
          padding: "20px",
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          backdropFilter: "blur(100px)",
          marginBottom: "20px"
        }}
      >
        <Typography variant="h6" gutterBottom>
          Detalle de Muestra de Suelo
        </Typography>

        <Typography variant="subtitle1">Fecha: {formattedDate}</Typography>
      </Paper>

      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        aria-label="Detalle de muestra de suelo tabs"
      >
        <Tab label="Características" />
        <Tab label="Variables del Suelo" />
      </Tabs>

      <TabPanel value={selectedTab} index={0}>
        <DataSection data={activity.characteristics} />
      </TabPanel>

      <TabPanel value={selectedTab} index={1}>
        <DataSection data={activity.soilVariables} />
      </TabPanel>
    </Box>
  );
};

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function DataSection({ data }) {
  return (
    <Paper
      elevation={3}
      sx={{
        padding: "16px",
        backgroundColor: "rgba(25, 118, 210, 0.1)", // Adjust alpha for transparency
        backdropFilter: "blur(10px)", // Apply blur effect
        marginTop: "16px"
      }}
    >
      <List>
        {Object.entries(data).map(([key, value]) => (
          <ListItem key={key}>
            <ListItemText primary={key} secondary={value} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}

export default GroundSampleDetails;
