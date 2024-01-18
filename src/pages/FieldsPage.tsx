import React, { useState, useCallback, useEffect, useRef } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import { Button } from "@mui/material";

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
import FieldsSideMenu from "../components/FieldsSideMenu";

export const FieldsPage: React.FC = () => {
  const [showNewField, setShowNewField] = useState(false);
  const [showNewLot, setShowNewLot] = useState(false);
  const map = useSelector(selectMap);
  const [fields, setFields] = useState<Field[]>([]);
  const db = new PouchDB("campos_randyv7");
  const [selectedField, setSelectedField] = useState<any | null>(null);
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const selectedFieldRef = useRef<Field | null>(null);
  const draw = useSelector(selectDraw);
  const dispatch = useDispatch();
  const isVisible = useSelector(
    (state: RootState) => state.fieldList.isVisible
  );

  useEffect(() => {
    selectedFieldRef.current = selectedField;
  }, [selectedField]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (map) {
      addFieldsToMap(map, fields);
    }
  }, [map, draw, fields]);

  const handleMapClick = useCallback(
    async (event: any) => {
      if (selectedField) {
        return;
      }

      const features = map?.queryRenderedFeatures(event.point);
      const fieldFeature = features?.find((f) => f.layer.id.endsWith("-fill"));

      if (fieldFeature) {
        const fieldId = fieldFeature.layer.source;
        console.log("Clicked field ID:", fieldId);

        if (typeof fieldId === "string") {
          try {
            const fieldDoc: Field = await db.get(fieldId);
            setSelectedField(fieldDoc);
            console.log("Field selected (setSelectedField called):", fieldDoc);

            addLotsToMap(map, fieldDoc.lotes);
            handleLocateField();
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
      map.on("click", handleMapClick);
    }
    return () => {
      if (map) {
        map.off("click", handleMapClick);
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

      console.log("Lot geometry:", lot.geometry);

      const lotCentroid = centroid(lot.geometry);
      if (
        lotCentroid &&
        lotCentroid.geometry &&
        lotCentroid.geometry.coordinates
      ) {
        const centroidCoordinates = lotCentroid.geometry.coordinates;
        console.log("Centroid coordinates:", centroidCoordinates);

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

  const handleSelectField = (field) => {
    console.log("Field selected from menu:", field);
    setSelectedField(field);
  };

  const handleSaveGeometry = (data) => {
    console.log("Event: guardar_nueva_geometria triggered");
    console.log("guardar_nueva_geometria", data);

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

    setSelectedLot(null);
  };

  const handleSaveGeometryLot = (data) => {
    console.log("Event: add_lot_to_field triggered");
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

  const addLotsToMap = (map: any, lots: any) => {
    console.log("addLotsToMap called: ", lots);
    lots.forEach((lot: any) => {
      const lotId = lot.id;

      const lotFeature = {
        type: "Feature",
        properties: { ...lot.properties },
        geometry: lot.geometry
      };

      map.on("click", lotId + "-fill", (e: any) => {
        e.preventDefault();
        handleLotClick(lotId);
      });

      if (map.getSource(lotId)) {
        map.getSource(lotId).setData(lotFeature);
      } else {
        map.addSource(lotId, {
          type: "geojson",
          data: lotFeature
        });
      }

      if (!map.getLayer(lotId + "-fill")) {
        map.addLayer({
          id: lotId + "-fill",
          type: "fill",
          source: lotId,
          layout: {},
          paint: {
            "fill-color": "#0080ff",
            "fill-opacity": 0.6
          }
        });
      }
    });
  };

  const handleLocateField = () => {
    console.log("selected field: ", selectedField);
    if (selectedField && map) {
      const fieldGeoJSON = selectedField.campo_geojson;
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
    console.log("handleCloseNewLot");
    setShowNewLot(false);
    fetchData();
  };

  const handleCreateLot = () => {
    handleLocateField();
    console.log("handleCreateLot");

    setShowNewLot(true);
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
      <MapComponent onMapLoad={onMapLoad} />
      <FieldsSideMenu
        open={isVisible}
        fields={fields}
        onSelectField={handleSelectField}
      />
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
        Agregar Campo
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
          }}
          onDelete={handleDeleteField}
          onLocate={handleLocateField}
          handleCreateLot={handleCreateLot}
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
