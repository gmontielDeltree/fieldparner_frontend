import React, { useState, useCallback, useEffect, useRef } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

import { Button, Grid } from "@mui/material";

import area from "@turf/area";
import { addFieldsToMapSingleLayer } from "../helpers/mapHelpers";
import NewsBar from "../components/NewsBar";
import MapComponent from "../components/Map";
import uuid4 from "uuid4";
import { Field, Lot } from "../interfaces/field";
import { useDispatch, useSelector } from "react-redux";
import { setMap, selectMap } from "../redux/map/mapSlice";
import { selectDraw } from "../redux/draw/drawSlice";
import { RootState } from "../redux/store";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { Devices } from "../../owncomponents/sensores/sensores";
import { addDepositosToMap } from "../../owncomponents/mapa-principal/depositos-layer";
import { useDeposit, useField } from "../hooks";
import useResizeObserver from "@react-hook/resize-observer";
import { dbContext } from "../services";
import { touchEvent } from "../../owncomponents/helpers";
import FieldsSideMenu from "../components/FieldsSideMenu";
import { useTranslation } from "react-i18next";
import { Actividad } from "../interfaces/activity";
import { format, isBefore, isToday, parseISO } from "date-fns";
import { hideFieldList } from "../redux/fieldsList";
import "../classes/engine/Engine";

export const FieldsPage: React.FC = () => {
  const map = useSelector(selectMap);
  const { fields, getFields } = useField();

  const db = dbContext.fields;

  const [selectedField, setSelectedField] = useState<any | null>(null);
  const selectedFieldRef = useRef<Field | null>(null);
  const draw = useSelector(selectDraw);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const location = useLocation();

  const isVisible = useSelector(
    (state: RootState) => state.fieldList.isVisible,
  );

  const navigate = useNavigate();

  const { deposits, getDeposits } = useDeposit();

  const updateMapAfterNew = () => {
    getFields();
  };

  /* Es para forzar el resizing del mapa siempre
    Cuando la pagina de
  */
  const target = useRef(null);
  useResizeObserver(target, (entry) => {
    if (map) {
      console.count("map resize obs");
      map.resize();
    }
  });

  /* null al map del store cuando se desmonta para evitar bug de reading undefined
    al regresar
  */
  useEffect(() => {
    return () => {
      dispatch(setMap(null));
    };
  }, []);

  useEffect(() => {
    selectedFieldRef.current = selectedField;
  }, [selectedField]);

  useEffect(() => {
    getFields();
    getDeposits();
  }, []);

  useEffect(() => {
    if (map) {
      addFieldsToMapSingleLayer(map, fields);

      let devices = new Devices();
      devices.add_markers_to_map_react(map, (deviceId: string, date: string) =>
        navigate(`device/${deviceId}/${date}`),
      );

      if (deposits) {
        addDepositosToMap(map, deposits, (e: string) => navigate(e));
      }
    }
  }, [map, draw, fields, deposits]);

  const handleMapClick = useCallback(
    async (event: any) => {
      // Ignorar si location es new-lot o new-field
      if (
        location.pathname.includes("new-lot") ||
        location.pathname.includes("new-field")
      ) {
        return;
      }

      const features = map?.queryRenderedFeatures(event.point);
      console.log(event, features);

      if (features.length > 0) {
        const fieldId = features[0].properties.id;
        const source = features[0].source;

        if (source === "campos") {
          try {
            // Navegar al campo
            navigate(fieldId);
          } catch (err) {
            console.error("Error fetching field from PouchDB", err);
          }
        } else if (source === "lotes") {
          let parentId = features[0].properties.campo_parent_id;
          let loteId = features[0].properties.uuid;
          // NAvegar al la pantalla de lote
          navigate(parentId + "/" + loteId);
        }
      }
    },
    [map, db, selectedField, location],
  );

  useEffect(() => {
    if (map) {
      map.on(touchEvent, handleMapClick);
    }
    return () => {
      if (map) {
        map.off(touchEvent, handleMapClick);
      }
    };
  }, [map, handleMapClick]);

  function roundArea(feature) {
    return Math.round((area(feature) / 10000) * 100) / 100;
  }

  function getField(fieldId, callback) {
    db.get(fieldId, callback);
  }

  function createNewLot(lotGeometry, lotName, fieldId) {
    const lotUuid = uuid4();
    const lotAreaHectares = roundArea(lotGeometry);

    return {
      id: lotUuid,
      type: "Feature",
      properties: {
        nombre: lotName,
        campo_parent_id: fieldId,
        uuid: lotUuid,
        hectareas: lotAreaHectares,
      },
      geometry: lotGeometry,
    };
  }

  function updateFieldWithLot(fieldId, field, newLot) {
    field.lotes.push(newLot);
    db.put({ ...field, _id: fieldId }, (error, result) => {
      if (!error) {
        console.log("Successfully added a new Lot to Campo!");
        updateUIAfterAddingLot(field, result);
      } else {
        console.log(error);
      }
    });
  }

  function updateUIAfterAddingLot(field, result) {
    setSelectedField({ ...field, lotes: field.lotes });
    addLotsToMap(map, field.lotes);
    handleCloseNewLot();
  }

  const addLotsToMap = (map, lots) => {
    let tooltip = document.getElementById("map-tooltip");
    if (!tooltip) {
      tooltip = document.createElement("div");
      tooltip.setAttribute("id", "map-tooltip");
      tooltip.style.position = "absolute";
      tooltip.style.minWidth = "200px";
      tooltip.style.maxWidth = "350px";
      tooltip.style.background = "#2a3f54";
      tooltip.style.color = "#fff";
      tooltip.style.padding = "10px";
      tooltip.style.borderRadius = "8px";
      tooltip.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.3)";
      tooltip.style.display = "none";
      tooltip.style.pointerEvents = "none";
      tooltip.style.zIndex = "9999";
      tooltip.style.fontFamily =
        "'Helvetica Neue', Helvetica, Arial, sans-serif";
      tooltip.style.fontSize = "14px";
      tooltip.style.lineHeight = "1.4";
      tooltip.style.transition = "opacity 0.3s";
      document.body.appendChild(tooltip);
    }
    lots.forEach((lot) => {
      const lotId = lot.id;
      const lotUUID = lot.properties.uuid;
      map.on("click", lotId + "-fill", (e) => {
        e.preventDefault();
        handleLotClick(lotId);
      });
      if (!map.getSource(lotId)) {
        map.addSource(lotId, {
          type: "geojson",
          data: {
            type: "Feature",
            properties: { ...lot.properties },
            geometry: lot.geometry,
          },
        });
      }
      if (!map.getLayer(`${lotId}-fill`)) {
        map.addLayer({
          id: `${lotId}-fill`,
          type: "fill",
          source: lotId,
          layout: {},
          paint: {
            "fill-color": "#0080ff",
            "fill-opacity": 0.6,
          },
        });
      }
      // Mousemove event
      map.on("mousemove", `${lotId}-fill`, async (e) => {
        // map.getCanvas().style.cursor = "pointer";
        const activities = await getActivities(lotUUID);
        const todayActivities = activities.filter(({ actividad }) =>
          isToday(
            new Date(
              actividad.detalles.fecha_ejecucion_tentativa || actividad.fecha,
            ),
          ),
        );
        let content = `<strong>No hay actividades programadas para hoy en el lote ${lot.properties.nombre}.</strong>`;
        if (todayActivities.length > 0) {
          content = `<strong>Actividades para hoy en el lote ${lot.properties.nombre}:</strong><ul style="padding-left: 20px;">`;
          todayActivities.forEach(({ actividad }) => {
            const activityDate = new Date(
              actividad.detalles.fecha_ejecucion_tentativa || actividad.fecha,
            );
            const time = format(activityDate, "p");
            content += `<li>${actividad.tipo}: Horario previsto a las ${time}.</li>`;
          });
          content += `</ul>`;
        }
        tooltip.innerHTML = content;
        tooltip.style.opacity = "0";
        tooltip.style.display = "block";
        tooltip.style.left = `${e.originalEvent.clientX + 15}px`;
        tooltip.style.top = `${e.originalEvent.clientY + 15}px`;
        setTimeout(() => (tooltip.style.opacity = "1"), 10);
      });
      // Mouseleave event
      map.on("mouseleave", `${lotId}-fill`, () => {
        // map.getCanvas().style.cursor = "";
        tooltip.style.opacity = "0";
        setTimeout(() => (tooltip.style.display = "none"), 300); // Delay hiding for animation
      });
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

  const getActivities = async (uuid_del_lote) => {
    let acts: Actividad[] = await gbl_docs_starting(
      "actividad",
      true,
      true,
      true,
    ).then(only_docs);

    let s = acts.filter(({ lote_uuid }) => lote_uuid === uuid_del_lote);

    let _actividades_docs = s.reverse();

    console.log("ACTIVIDADES", _actividades_docs, acts);

    let result = await db.allDocs({
      startkey: "ejecucion:",
      endkey: "ejecucion:\ufff0",
    });

    let respuesta: { actividad: Actividad; ejecucion_id: string }[] = [];

    if (result.rows) {
      _actividades_docs.forEach((actividad) => {
        let midoc = result.rows.find((doc) => doc.id.includes(actividad.uuid));
        respuesta.push({ actividad: actividad, ejecucion_id: midoc?.id });
      });

      respuesta.sort((a, b) => {
        let fecha_1 = a.ejecucion_id
          ? parseISO(a.ejecucion_id.split(":")[1])
          : parseISO(
              a.actividad.tipo === "nota"
                ? a.actividad.fecha
                : a.actividad.detalles.fecha_ejecucion_tentativa,
            );
        let fecha_2 = b.ejecucion_id
          ? parseISO(b.ejecucion_id.split(":")[1])
          : parseISO(
              b.actividad.tipo === "nota"
                ? b.actividad.fecha
                : b.actividad.detalles.fecha_ejecucion_tentativa,
            );
        return isBefore(fecha_1, fecha_2) ? 1 : -1;
      });
    }

    return respuesta ? respuesta : null;
  };
  const handleDirectLotSelection = (lot, field) => {
    navigate(`${field._id}/${lot.id}`);
    // handleSelectField(field);
    // dispatch(hideFieldList());
    // setTimeout(() => {
    //   handleLotClick(lot.id);
    // }, 500);
  };

  const gbl_docs_starting = async (
    key: string,
    devolver_docs: boolean = false,
    attachments: boolean = false,
    binary: boolean = false,
  ) => {
    return db
      .allDocs({
        include_docs: devolver_docs,
        attachments: attachments,
        binary: binary,
        startkey: key,
        endkey: key + "\ufff0",
      })
      .then((result) => {
        return result;
      });
  };

  const handleSelectField = (field) => {
    console.log("Field selected from menu:", field);
    // setSelectedField(field);
    // addLotsToMap(map, field.lotes);
    // handleLocateField(field);
    navigate(field._id);
  };

  const onMapLoad = useCallback(
    (event: any) => {
      const map = event.target;
      dispatch(setMap(map));
    },
    [dispatch, draw],
  );

  const handleCloseNewLot = () => {
    setShowNewLot(false);
    fetchData();
  };

  const fetchData = async () => {
    try {
      const allDocs = await db.allDocs({ include_docs: true });
      const fetchedFields = allDocs.rows
        .map((row) => row.doc)
        .filter((doc): doc is Field => doc !== undefined && isField(doc));
      console.log("fetchedFields from PouchDB...", fetchedFields);
      setFields(fetchedFields);
    } catch (err) {
      console.error("Error fetching data from PouchDB", err);
    }
  };

  function isField(doc: any): doc is Field {
    return (
      doc &&
      typeof doc === "object" &&
      "_id" in doc &&
      "nombre" in doc &&
      "campo_geojson" in doc
    );
  }

  return (
    <>
      {/* TODO: si el usuario presiona el boton de la lista de campos mientras esta en otro route, la lista no va a aparecer */}
      <FieldsSideMenu
        open={isVisible}
        fields={fields}
        onSelectField={handleSelectField}
        onSelectLot={handleDirectLotSelection}
      />

      <Grid container style={{ position: "relative" }} ref={target}>
        <MapComponent onMapLoad={onMapLoad} />
      </Grid>

      {/* Mostrar el boton de add_field solo en la pantalla "principal" */}

      {location.pathname === "/init/overview/fields" && (
        <Button
          color="primary"
          variant="contained"
          style={{
            position: "absolute",
            bottom: 30,
            right: 20,
          }}
          onClick={() =>
            //setShowNewField(true)
            navigate("new-field")
          }
        >
          {t("add_field")}
        </Button>
      )}

      {/* Renderizado de subrutas */}
      {map && <Outlet context={{ updateMapAfterNew: updateMapAfterNew }} />}

      <NewsBar />
    </>
  );
};
