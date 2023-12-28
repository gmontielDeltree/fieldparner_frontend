import React, { useEffect, useState } from "react";
import PlanSowing from "./PlanSowing";
import { Avatar, ButtonBase, Paper } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import categoryIcon1 from "../../images/icons/sembradora_act.webp";
import categoryIcon2 from "../../images/icons/pulverizadora_act.webp";
import categoryIcon3 from "../../images/icons/cosechadora_act.webp";
import categoryIcon4 from "../../images/icons/iconodenotas_act.webp";
import categoryIcon5 from "../../images/icons/iconosatelite.webp";
import categoryIcon6 from "../../images/icons/suelo_act.webp";
import PouchDB from "pouchdb";
import { Activities } from "./Activities/index";
import { Actividad } from "../../interfaces/activity";
import { isBefore, isWithinInterval, parseISO } from "date-fns";
import activitiesData from "./test.json";

interface LotsMenuProps {
  lot: any;
  isOpen: () => void;
  toggle: () => void;
}

const LotsMenu: React.FC<LotsMenuProps> = ({ lot, isOpen, toggle }) => {
  const db = new PouchDB("campos_randyv7");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activities, setActivities] = useState(null);

  const categories = [
    { id: "Planificar Siembra", icon: categoryIcon1 },
    { id: "Category 2", icon: categoryIcon2 },
    { id: "Category 3", icon: categoryIcon3 },
    { id: "Category 4", icon: categoryIcon4 },
    { id: "Category 5", icon: categoryIcon5 },
    { id: "Category 6", icon: categoryIcon6 }
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
      // Iter 1: Actividades
      _actividades_docs.forEach((actividad) => {
        let midoc = result.rows.find((doc) => doc.id.includes(actividad.uuid));
        respuesta.push({ actividad: actividad, ejecucion_id: midoc?.id });
      });

      console.log("Respuesta actividades y ejecuciones preorden", respuesta);
      // Ordenar respuesta teniendo en cuenta la ejecución.
      respuesta.sort((a, b) => {
        // Si tiene ejecucion usar la fecha de ejecucion
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
    }
  }, [lot, selectedCategory]);

  useEffect(() => {
    if (lot && lot.id) {
      getActivities(lot.id).then((res) => setActivities(res));
    }
  }, [lot, selectedCategory]);

  const renderFormContent = () => {
    if (!selectedCategory) {
      return activities && activities.length > 0 ? (
        <Activities activitiesData={activities} />
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
          <PlanSowing lot={lot} db={db} backToActivites={backToActivites} />
        );
      case "Category 2":
        return <div>Category 2</div>;
      case "Category 3":
        return <div>Category 3</div>;
      case "Category 4":
        return <div>Category 4</div>;
      case "Category 5":
        return <div>Category 5</div>;
      case "Category 6":
        return <Activities activitiesData={activities} />;
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
          {categories.map(({ id, icon }) => (
            <ButtonBase key={id} onClick={() => selectCategory(id)}>
              <Avatar alt={id} src={icon} sx={avatarStyle(id)} />
            </ButtonBase>
          ))}
        </div>
        <IconButton aria-label="close" onClick={toggle}>
          <CloseIcon />
        </IconButton>
      </div>
      <hr style={hrStyle} />
      <div>{renderFormContent()}</div>
    </Paper>
  );
};

export default LotsMenu;
