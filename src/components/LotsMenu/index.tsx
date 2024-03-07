import React, { useEffect, useState } from "react";
import PlanActivity from "./PlanActivity";
import Tour from "./Tour";
import {
  Avatar,
  Box,
  ButtonBase,
  Fade,
  Paper,
  Tooltip,
  Typography
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import categoryIcon1 from "../../images/icons/sembradora_act.webp";
import categoryIcon2 from "../../images/icons/pulverizadora_act.webp";
import categoryIcon3 from "../../images/icons/cosechadora_act.webp";
import categoryIcon4 from "../../images/icons/iconodenotas_act.webp";
import categoryIcon5 from "../../images/icons/iconosatelite.webp";
import categoryIcon6 from "../../images/icons/suelo_act.webp";
import { Activities } from "./Activities/index";
import { Actividad } from "../../interfaces/activity";
import { isBefore, parseISO } from "date-fns";
import GroundSample from "./GroundSample";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ExecuteActivity from "./ExecuteActivity";
import { dbContext } from "../../services";
import { styled } from "@mui/material/styles";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "../../hooks";
import { setLotActive } from "../../redux/map";

const Header = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: "center",
  color: theme.palette.text.secondary,
  background: `linear-gradient(to right, ${theme.palette.primary.light}, ${theme.palette.secondary.main})`,
  boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
  borderRadius: "8px",
  margin: theme.spacing(2, 0)
}));

const FieldInfo = styled("div")(({ theme }) => ({
  fontWeight: "bold",
  fontSize: "1.2rem",
  color: theme.palette.primary.contrastText
}));

interface LotsMenuProps {
  lot: any;
  field: any;
  isOpen: () => void;
  toggle: () => void;
}

const LotsMenu: React.FC<LotsMenuProps> = ({ lot, field, isOpen, toggle }) => {
  const dispatch = useAppDispatch();
  const [selectedCategory, setSelectedCategory] = useState<null | string>(null);
  const db = dbContext.fields; //new PouchDB("campos_randyv7");
  const [activities, setActivities] = useState(null);
  const { t } = useTranslation();
  const [editingActivityInfo, setEditingActivityInfo] = useState<{
    activity: Actividad | null;
    isExecuting: boolean;
  }>({ activity: null, isExecuting: false });
  const selectedCampaign = useSelector(
    (state: RootState) => state.campaign.selectedCampaign
  );

  const navigate = useNavigate();

  console.log("Lot seleccionado: ", lot);
  const categories = [
    { id: "Planificar Siembra", icon: categoryIcon1 },
    { id: "Planificar Aplicacion", icon: categoryIcon2 },
    { id: "Planificar Cosecha", icon: categoryIcon3 },
    { id: "Recorrido", icon: categoryIcon4 },
    {
      id: "Vista de Satelite",
      icon: categoryIcon5,
      link: `/init/overview/satellite/${lot.id}`
    },
    { id: "Muestra de suelo", icon: categoryIcon6 }
  ];

  const selectCategory = (categoryId: any) => {
    setSelectedCategory(categoryId);
  };

  const backToActivites = () => {
    setSelectedCategory(null);
    if (lot && lot.id) {
      getActivities(lot.id).then((res) => setActivities(res));
    }
  };

  const activityTypeTranslations = {
    siembra: "sowing",
    cosecha: "harvesting",
    aplicacion: "application"
  };
  const avatarStyle = (categoryId: any) => ({
    width: 50,
    height: 50,
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    transform: selectedCategory === categoryId ? "scale(1.2)" : "scale(1)",
    boxShadow:
      selectedCategory === categoryId ? "0 4px 20px rgba(0,0,0,0.2)" : "none",
    borderRadius: "50%",
    margin: "0 15px",
    cursor: "pointer",
    opacity: 1,
    filter: selectedCampaign ? "none" : "grayscale(100%)",
    "&:hover": {
      transform: "scale(1.2)",
      boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
    }
  });

  const getActivities = async (uuid_del_lote) => {
    let acts: Actividad[] = await gbl_docs_starting(
      "actividad",
      true,
      true,
      true
    ).then(only_docs);

    let s = acts.filter(({ lote_uuid }) => lote_uuid === uuid_del_lote);

    let _actividades_docs = s.reverse();

    console.log("ACTIVIDADES", _actividades_docs, acts);

    let result = await db.allDocs({
      startkey: "ejecucion:",
      endkey: "ejecucion:\ufff0"
    });

    let respuesta: { actividad: Actividad; ejecucion_id: string }[] = [];

    if (result.rows) {
      _actividades_docs.forEach((actividad) => {
        let midoc = result.rows.find((doc) => doc.id.includes(actividad.uuid));
        respuesta.push({ actividad: actividad, ejecucion_id: midoc?.id });
      });

      console.log("Respuesta actividades y ejecuciones preorden", respuesta);
      respuesta.sort((a, b) => {
        let fecha_1 = a.ejecucion_id
          ? parseISO(a.ejecucion_id.split(":")[1])
          : parseISO(
            a.actividad.tipo === "nota"
              ? a.actividad.fecha
              : a.actividad.detalles.fecha_ejecucion_tentativa
          );
        let fecha_2 = b.ejecucion_id
          ? parseISO(b.ejecucion_id.split(":")[1])
          : parseISO(
            b.actividad.tipo === "nota"
              ? b.actividad.fecha
              : b.actividad.detalles.fecha_ejecucion_tentativa
          );
        return isBefore(fecha_1, fecha_2) ? 1 : -1;
      });
    }

    console.log("Respuesta actividades y ejecuciones post orden", respuesta);

    return respuesta ? respuesta : null;
  };

  const gbl_docs_starting = async (
    key: string,
    devolver_docs: boolean = false,
    attachments: boolean = false,
    binary: boolean = false
  ) => {
    return db
      .allDocs({
        include_docs: devolver_docs,
        attachments: attachments,
        binary: binary,
        startkey: key,
        endkey: key + "\ufff0"
      })
      .then((result) => {
        return result;
      });
  };
  const handleEditActivity = (activity, isExecuting = false) => {
    if (isExecuting) {
      setSelectedCategory("Execute Activity");
    } else {
      setSelectedCategory("Edit Activity");
    }

    console.log("Editando actividad POR EJECUCION", activity, isExecuting);
    setEditingActivityInfo({ activity, isExecuting });
  };

  const only_docs = (alldocs: PouchDB.Core.AllDocsResponse<{}>) => {
    if (alldocs.rows.length > 0) {
      return alldocs.rows.map((row) => {
        return row.doc;
      });
    } else {
      return [];
    }
  };
  useEffect(() => {
    if (lot && lot.id) {
      getActivities(lot.id).then((res) => setActivities(res));
      dispatch(setLotActive(lot));
    }
  }, [lot, selectedCategory, dispatch]);

  // useEffect(() => {
  //   if (lot && lot.id) {
  //     getActivities(lot.id).then((res) => setActivities(res));
  //   }
  // }, [lot, selectedCategory]);

  const renderFormContent = () => {
    if (!selectedCampaign) {
      return (
        <Fade in={true} timeout={1000}>
          <Box textAlign="center" marginTop="20px">
            {/* <CampaignIcon sx={{ fontSize: 60, color: "rgba(0, 0, 0, 0.54)" }} /> */}
            <Typography variant="h5" component="h2" gutterBottom>
              {t("choose_a_campaign")}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {t("select_a_campaign_from_the_top_row")}
            </Typography>
          </Box>
        </Fade>
      );
    }
    if (!selectedCategory) {
      return activities && activities.length > 0 ? (
        <Activities
          activitiesData={activities}
          setActivitiesData={setActivities}
          lotDoc={lot}
          fieldDoc={field}
          handleEditActivity={handleEditActivity}
        />
      ) : (
        <div style={{ textAlign: "center" }}>
          <p>No hay actividades.</p>
          <p>Agregue alguna utilizando los botones superiores</p>
        </div>
      );
    }

    switch (selectedCategory) {
      case "Planificar Siembra":
        return (
          <PlanActivity
            activityType={"sowing"}
            lot={lot}
            fieldName={field.nombre}
            db={db}
            backToActivites={backToActivites}
          />
        );
      case "Planificar Cosecha":
        return (
          <PlanActivity
            activityType={"harvesting"}
            lot={lot}
            fieldName={field.nombre}
            db={db}
            backToActivites={backToActivites}
          />
        );
      case "Planificar Aplicacion":
        return (
          <PlanActivity
            activityType={"application"}
            lot={lot}
            fieldName={field.nombre}
            db={db}
            backToActivites={backToActivites}
          />
        );
      case "Recorrido":
        return (
          <Tour
            lot={lot}
            db={db}
            fieldName={field.nombre}
            backToActivites={backToActivites}
          />
        );
      case "Category 5":
        return <div>Category 5</div>;
      case "Muestra de suelo":
        return (
          <GroundSample
            lot={lot}
            db={db}
            fieldName={field.nombre}
            backToActivites={backToActivites}
          />
        );
      case "Edit Activity":
        return (
          <PlanActivity
            activityType={
              activityTypeTranslations[
              editingActivityInfo.activity.tipo.toLowerCase()
              ]
            }
            lot={lot}
            fieldName={field.nombre}
            db={db}
            backToActivites={backToActivites}
            existingActivity={editingActivityInfo.activity}
          />
        );
      case "Execute Activity":
        return (
          <ExecuteActivity
            activityType={
              activityTypeTranslations[
              editingActivityInfo.activity.tipo.toLowerCase()
              ]
            }
            lot={lot}
            db={db}
            fieldName={field.nombre}
            backToActivites={backToActivites}
            existingActivity={editingActivityInfo.activity}
            isExecuting={editingActivityInfo.isExecuting}
          />
        );

      default:
        return <div>Select a category to view its forms</div>;
    }
  };

  const hrStyle = {
    border: "0",
    height: "1px",
    backgroundImage:
      "linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0))",
    margin: "20px 0"
  };

  if (!isOpen) return null;

  return (
    <Paper
      elevation={5}
      style={{
        position: "fixed",
        top: "64px",
        height: "calc(100vh - 64px)",
        width: "60vw",
        overflowY: "auto",
        backgroundColor: "#fff",
        padding: "20px",
        zIndex: 1050,
        boxShadow: "0 6px 15px rgba(0,0,0,0.2)"
      }}
    >
      <div
        style={{
          display: "flex",
          marginBottom: "20px",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        <div>
          <div>
            {categories.map(({ id, icon, link }) => (
              <Tooltip
                title={id}
                arrow
                placement="top"
                sx={{
                  tooltip: {
                    backgroundColor: "#333",
                    color: "white",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
                    fontSize: "1em"
                  },
                  arrow: {
                    color: "#333"
                  }
                }}
              >
                <ButtonBase
                  key={id}
                  onClick={() => (link ? navigate(link) : selectCategory(id))}
                >
                  <Avatar alt={id} src={icon} sx={avatarStyle(id)} />
                </ButtonBase>
              </Tooltip>
            ))}
          </div>
        </div>
        <div>
          {selectedCategory && (
            <IconButton
              aria-label="back to activities"
              onClick={backToActivites}
            >
              <ArrowBackIcon />
            </IconButton>
          )}
          <IconButton aria-label="close" onClick={toggle}>
            <CloseIcon />
          </IconButton>
        </div>
      </div>
      <hr style={hrStyle} />

      <Header>
        <FieldInfo>Lote: {lot.properties.nombre}</FieldInfo>
        <FieldInfo>Campo: {field.nombre}</FieldInfo>
      </Header>
      <div>{renderFormContent()}</div>
    </Paper>
  );
};

export default LotsMenu;
