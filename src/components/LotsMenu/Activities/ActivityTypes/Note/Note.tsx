import { useState } from "react";
import Typography from "@mui/material/Typography";
import { Box, Tabs, Tab, IconButton, Menu, MenuItem } from "@mui/material";
import EventNoteIcon from "@mui/icons-material/EventNote";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import NoteContent from "../TabsContent/Note";
import AttachedContent from "../TabsContent/Attached";
import NotePoints from "../TabsContent/Points";
import { format, parseISO } from "date-fns";
import { es, enUS, pt } from "date-fns/locale";
import { useTranslation } from "react-i18next";

function Note({
  activity,
  complementaryColor,
  handleDeleteActivity,
  handleEditActivity
}) {
  const { t, i18n } = useTranslation();
  const [selectedTab, setSelectedTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Get the appropriate locale based on the current language
  const getDateLocale = () => {
    if (i18n.language.startsWith('es')) {
      return es;
    } else if (i18n.language.startsWith('pt')) {
      return pt;
    } else {
      return enUS; // Default to English
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleViewAllPoints = () => {
    // Change to the Points tab when the button is clicked
    setSelectedTab(1);
  };

  const formattedPlanificadaDate = activity.actividad.fecha
    ? format(parseISO(activity.actividad.fecha), "PPPP", { locale: getDateLocale() })
    : t('dateNotDefined');

  return (
    <div>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px"
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            borderRadius: "4px",
            padding: "4px 8px",
            flexGrow: 1
          }}
        >
          <EventNoteIcon
            sx={{ marginRight: "4px", color: complementaryColor }}
          />
          <Typography
            sx={{ fontSize: 16, fontWeight: "bold" }}
            color="text.primary"
          >
            {formattedPlanificadaDate}
          </Typography>

          <Typography
            sx={{ fontSize: 16, fontWeight: "bold" }}
            style={{ marginLeft: "10px" }}
          >
            {activity.actividad.nombre}
          </Typography>

          <Typography
            sx={{ fontSize: 16, fontWeight: "bold" }}
            style={{ marginLeft: "10px", color: activity.actividad.color }}
          >
            {activity.actividad.color == "red" ? t('urgent') : t('normal')}
          </Typography>
        </Box>
        <Typography
          sx={{ fontSize: 16, flexGrow: 2, textAlign: "right" }}
          color="text.secondary"
        >
          {activity.actividad.tipo}
        </Typography>
        <IconButton onClick={handleMenuClick} sx={{ marginLeft: "8px" }}>
          <MoreVertIcon />
        </IconButton>
      </Box>

      {/* LGO Comento los items que no estan implementados aún */}
      <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
        <MenuItem
          onClick={() => handleEditActivity(activity.actividad, false, "note")}
        >
          {t('edit')}
        </MenuItem>

        {/* <MenuItem onClick={handleMenuClose}>{t('repeatPlan')}</MenuItem> */}
        {/* <MenuItem onClick={handleMenuClose}>
          {t('shareWorkOrder')}
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          {t('executionVsPlanningPdf')}
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>{t('meteorologicalData')}</MenuItem> */}
        <MenuItem onClick={() => handleDeleteActivity(activity.actividad._id)}>
          {t('delete')}
        </MenuItem>
      </Menu>

      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ marginBottom: "16px" }}
      >
        <Tab label={t('note')} />
        <Tab label={t('points')} />
      </Tabs>

      {selectedTab === 0 && (
        <NoteContent
          activity={activity.actividad}
          onViewAllPoints={handleViewAllPoints}
        />
      )}
      {selectedTab === 1 && <NotePoints activity={activity.actividad} />}
      {selectedTab === 2 && <AttachedContent />}
    </div>
  );
}

export default Note;