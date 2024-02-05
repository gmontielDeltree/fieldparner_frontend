import React, { useState, useCallback, useEffect, useRef } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import { Box, Button, Grid } from "@mui/material";

import centroid from "@turf/centroid";

import area from "@turf/area";
import PouchDB from "pouchdb";
import NewField from "../components/NewField";
import { addFieldsToMap } from "../helpers/mapHelpers";
import EditField from "../components/EditField";
import NewsBar from "../components/NewsBar";
import NewLot from "../components/NewLot";
import MapComponent from "../components/Map";
import convex from "@turf/convex";
import LotsMenu from "../components/LotsMenu";
import uuid4 from "uuid4";
import { Field, Lot } from "../interfaces/field";
import { useDispatch, useSelector } from "react-redux";
import { setMap, selectMap } from "../redux/map/mapSlice";
import { selectDraw } from "../redux/draw/drawSlice";
import { RootState } from "../redux/store";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { Devices } from "../../owncomponents/sensores/sensores";
import { addDepositosToMap } from "../../owncomponents/mapa-principal/depositos-layer";
import { useDeposit } from "../hooks";
import useResizeObserver from "@react-hook/resize-observer";
import { dbContext } from "../services";
import { touchEvent } from "../../owncomponents/helpers";
import FieldsSideMenu from "../components/FieldsSideMenu";
import { useTranslation } from "react-i18next";
import { Actividad } from "../interfaces/activity";
import { format, isBefore, isToday, parseISO } from "date-fns";

export const FieldsPage: React.FC = () => {
  const [showNewField, setShowNewField] = useState(false);
  const [showNewLot, setShowNewLot] = useState(false);
  const map = useSelector(selectMap);
  const [fields, setFields] = useState<Field[]>([]);
  const db = dbContext.fields; // new PouchDB("campos_randyv7");
  const [selectedField, setSelectedField] = useState<any | null>(null);
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const selectedFieldRef = useRef<Field | null>(null);
  const draw = useSelector(selectDraw);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const isVisible = useSelector(
    (state: RootState) => state.fieldList.isVisible
  );

  const navigate = useNavigate();

  const { loteId, campoId } = useParams();

  const { deposits, getDeposits } = useDeposit();

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
      console.log("UNMOUNT MAP");
      dispatch(setMap(null));
    };
  }, []);

  useEffect(() => {
    selectedFieldRef.current = selectedField;
  }, [selectedField]);

  useEffect(() => {
    fetchData();
    getDeposits();
  }, []);

  useEffect(() => {
    if (map) {
      addFieldsToMap(map, fields);

      let devices = new Devices();
      devices.add_markers_to_map_react(map, (deviceId: string, date: string) =>
        navigate(`device/${deviceId}/${date}`)
      );

      if (deposits) {
        addDepositosToMap(map, deposits, (e: string) => navigate(e));
      }
    }
  }, [map, draw, fields, deposits]);

  const handleMapClick = useCallback(
    async (event: any) => {
      if (selectedField) {
        return;
      }

      const features = map?.queryRenderedFeatures(event.point);
      const fieldFeature = features?.find((f) => f.layer.id.endsWith("-fill"));

      if (fieldFeature) {
        const fieldId = fieldFeature.layer.source;

        if (typeof fieldId === "string") {
          try {
            const fieldDoc: Field = await db.get(fieldId);
            setSelectedField(fieldDoc);
            console.log("Field selected (setSelectedField called):", fieldDoc);

            addLotsToMap(map, fieldDoc.lotes);
            handleLocateField(selectedField);
            navigate(fieldId);
          } catch (err) {
            console.error("Error fetching field from PouchDB", err);
          }
        } else {
          console.error("Field ID is undefined");
        }
      }
    },
    [map, db, selectedField]
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

  const handleLotClick = (lotId: string) => {
    const currentSelectedField = selectedFieldRef.current;
    if (!currentSelectedField) {
      console.warn("No field selected");
      return;
    }

    const lot = currentSelectedField.lotes.find((l) => l.id === lotId);
    if (lot && map) {
      setSelectedLot(lot);
      navigate(lotId);

      const lotCentroid = centroid(lot.geometry);
      if (
        lotCentroid &&
        lotCentroid.geometry &&
        lotCentroid.geometry.coordinates
      ) {
        const centroidCoordinates = lotCentroid.geometry.coordinates;

        if (
          Array.isArray(centroidCoordinates) &&
          centroidCoordinates.length === 2
        ) {
          const longitudeAdjustment = 0.005;
          const adjustedCoordinates = [
            centroidCoordinates[0] - longitudeAdjustment,
            centroidCoordinates[1]
          ];

          map.flyTo({ center: adjustedCoordinates, zoom: 16, pitch: 45 });
        } else {
          console.error("Invalid centroid coordinates:", centroidCoordinates);
        }
      } else {
        console.error("Unable to calculate the centroid of the lot");
      }

      map.setPaintProperty(lotId + "-fill", "fill-color", "#808080");
    }
  };

  const handleSaveGeometry = (data) => {
    const geometryData = data.geometry ? data.geometry[0] : data;

    const campoGeojson =
      geometryData.features.length > 1
        ? convex(geometryData.features)
        : geometryData.features[0];

    const name =
      data.field_name || geometryData.features[0]?.properties?.name || "";
    const uuid = uuid4();

    if (campoGeojson && campoGeojson.properties) {
      campoGeojson.properties.hectareas = roundArea(campoGeojson);
    }

    const lotes =
      geometryData.features.length > 1
        ? processLotes(geometryData.features, name)
        : [];

    const campoData = {
      _id: "campos_" + name,
      nombre: name,
      campo_geojson: campoGeojson,
      uuid,
      lotes
    };

    dbPut(campoData, (err, result) => {
      if (!err) {
        console.log("Successfully posted a Campo!");
        updateFields(campoData, result.rev);
      } else {
        console.log(err);
      }
    });
  };

  function roundArea(feature) {
    return Math.round((area(feature) / 10000) * 100) / 100;
  }

  function processLotes(features, name) {
    return features.map((feature) => {
      const lote = { ...feature };
      lote.properties = {
        ...lote.properties,
        nombre: lote.properties?.name,
        uuid: uuid4(),
        campo_parent_id: "campos_" + name,
        hectareas: roundArea(lote),
        actividades: []
      };
      lote.id = lote.properties.uuid;
      return lote;
    });
  }

  function dbPut(campoData, callback) {
    db.put(campoData, callback);
  }

  function updateFields(campoData, rev) {
    draw.deleteAll();
    setFields((prevFields) => [...prevFields, { ...campoData, _rev: rev }]);
  }

  const toggleLotDetailsModal = () => {
    if (selectedLot && map) {
      map.flyTo({ pitch: 0 });

      map.setPaintProperty(selectedLot.id + "-fill", "fill-color", "#0080ff");
    }

    if (campoId) {
      navigate("/init/overview/fields/" + campoId);
    }
    setSelectedLot(null);
  };

  const handleSaveGeometryLot = (data) => {
    console.log("add_lot_to_field", data);

    const lotGeometry = data.geometry[0].features[0].geometry;
    const lotName = data.field_name;
    const fieldId = `campos_${selectedField?.nombre}`;

    getField(fieldId, (err, field) => {
      if (err) {
        console.log("Error retrieving field:", err);
        return;
      }

      const newLot = createNewLot(lotGeometry, lotName, fieldId);
      updateFieldWithLot(fieldId, field, newLot);
    });
  };

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
        hectareas: lotAreaHectares
      },
      geometry: lotGeometry
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
            geometry: lot.geometry
          }
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
            "fill-opacity": 0.6
          }
        });
      }

      // Mousemove event
      map.on("mousemove", `${lotId}-fill`, async (e) => {
        map.getCanvas().style.cursor = "pointer";

        const activities = await getActivities(lotUUID);
        const todayActivities = activities.filter(({ actividad }) =>
          isToday(
            new Date(
              actividad.detalles.fecha_ejecucion_tentativa || actividad.fecha
            )
          )
        );

        let content = `<strong>No hay actividades programadas para hoy en el lote ${lot.properties.nombre}.</strong>`;
        if (todayActivities.length > 0) {
          content = `<strong>Actividades para hoy en el lote ${lot.properties.nombre}:</strong><ul style="padding-left: 20px;">`;
          todayActivities.forEach(({ actividad }) => {
            const activityDate = new Date(
              actividad.detalles.fecha_ejecucion_tentativa || actividad.fecha
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
        map.getCanvas().style.cursor = "";
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

  const handleSelectField = (field) => {
    console.log("Field selected from menu:", field);
    setSelectedField(field);
    addLotsToMap(map, field.lotes);
    handleLocateField(field);
  };

  const handleLocateField = (field) => {
    if (field && map) {
      const fieldGeoJSON = field.campo_geojson;
      if (fieldGeoJSON && fieldGeoJSON.geometry) {
        const coordinates = fieldGeoJSON.geometry.coordinates[0][0];
        const [longitude, latitude] = coordinates;
        map.flyTo({ center: [longitude, latitude], zoom: 15 });
      }
    }
  };

  const onMapLoad = useCallback(
    (event: any) => {
      const map = event.target;
      dispatch(setMap(map));
      if (!map.hasControl(draw)) {
        map.addControl(draw);
      }
    },
    [dispatch, draw]
  );

  const removeLotsFromMap = (map: any, lots: any) => {
    lots = selectedField.lotes;
    lots.forEach((lot: any) => {
      const lotId = lot.id;

      if (map.getLayer(lotId + "-fill")) {
        map.removeLayer(lotId + "-fill");
      }

      if (map.getSource(lotId)) {
        map.removeSource(lotId);
      }
    });
  };

  const handleDeleteField = async () => {
    if (selectedField && map) {
      try {
        await db.remove(selectedField._id, selectedField._rev);

        const fieldId = selectedField._id;
        map.removeLayer(`${fieldId}-fill`);
        map.removeLayer(`${fieldId}-line`);
        map.removeLayer(`${fieldId}-label`);
        map.removeSource(fieldId);

        setSelectedField(null);

        console.log("Field deleted successfully");
      } catch (err) {
        console.error("Error deleting field:", err);
      }
    }
  };

  const handleCloseNewField = () => {
    setShowNewField(false);
  };

  const handleCloseNewLot = () => {
    setShowNewLot(false);
    fetchData();
  };

  const handleCreateLot = () => {
    handleLocateField(selectedField);

    setShowNewLot(true);
  };

  const handleCreateUniqueLot = (field: any) => {
    const data = {
      field_name: "unique_lot",
      geometry: [
        {
          type: "FeatureCollection",
          features: [field.campo_geojson]
        }
      ]
    };
    handleSaveGeometryLot(data);
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
      <FieldsSideMenu
        open={isVisible}
        fields={fields}
        onSelectField={handleSelectField}
      />
      <Outlet />
      <Grid container style={{ position: "relative" }} ref={target}>
        <MapComponent onMapLoad={onMapLoad} />
      </Grid>

      <Button
        color="primary"
        variant="contained"
        style={{
          position: "absolute",
          bottom: 30,
          right: 20
        }}
        onClick={() => setShowNewField(true)}
      >
        {t("add_field")}
      </Button>

      {showNewField ? (
        <NewField
          saveGeometry={handleSaveGeometry}
          onClose={handleCloseNewField}
        />
      ) : null}

      {showNewLot ? (
        <NewLot handleSaveGeometryLot={handleSaveGeometryLot} />
      ) : null}

      {selectedField && !showNewLot && !selectedLot ? (
        <EditField
          isOpen={!!selectedField}
          field={selectedField}
          onClose={() => {
            removeLotsFromMap(map, selectedField.Lotes);
            setSelectedField(null);
            navigate("/init/overview/fields");
          }}
          onDelete={handleDeleteField}
          onLocate={handleLocateField}
          handleCreateLot={handleCreateLot}
          handleCreateUniqueLot={handleCreateUniqueLot}
        />
      ) : null}

      {selectedLot && (
        <LotsMenu
          lot={selectedLot}
          field={selectedField}
          isOpen={() =>
            function () {
              return !!selectedLot;
            }
          }
          toggle={() => toggleLotDetailsModal()}
        />
      )}
      <NewsBar />
    </>
  );
};
