import React, { useState, useCallback, useEffect, useRef } from "react";
import Map from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Button } from "@mui/material";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import center from "@turf/center";
import PouchDB from "pouchdb";
import NewField from "../components/NewField";
import { addFieldsToMap } from "../helpers/mapHelpers";
import EditField from "../components/EditField";
import NewsBar from "../components/NewsBar";
import NewLot from "../components/NewLot";
import MapComponent from "../components/Map";
import LotDetailsModal from "../components/NewLot/LotDetailsModal";
interface Lot {
  id: string;
  type: string;
  properties: {
    nombre: string;
    campo_parent_id: string;
    uuid: string;
    hectareas: number;
  };
  geometry: {
    coordinates: number[][][];
    type: string;
  };
}

interface Field {
  nombre: string;
  campo_geojson: any;
  uuid: string;
  lotes: Lot[];
  _id: string;
  _rev: string;
}

export const FieldsPage: React.FC = () => {
  const [showNewField, setShowNewField] = useState(false);
  const [showNewLot, setShowNewLot] = useState(false);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [draw, setDraw] = useState<MapboxDraw>(new MapboxDraw({}));
  const db = new PouchDB("campos_randyv7");
  const [selectedField, setSelectedField] = useState<any | null>(null);
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const selectedFieldRef = useRef<Field | null>(null);

  useEffect(() => {
    selectedFieldRef.current = selectedField;
  }, [selectedField]);

  const handleLotClick = (lotId: string) => {
    const currentSelectedField = selectedFieldRef.current;
    if (!currentSelectedField) {
      console.warn("No field selected");
      return;
    }

    const lot = currentSelectedField.lotes.find((l) => l.id === lotId);
    if (lot && map) {
      setSelectedLot(lot);

      const centerCoordinates = center(lot.geometry).geometry.coordinates;
      map.flyTo({ center: centerCoordinates, zoom: 17, pitch: 45 });

      map.setPaintProperty(lotId + "-fill", "fill-color", "#808080");
    }
  };

  const toggleLotDetailsModal = () => {
    if (selectedLot && map) {
      map.flyTo({ pitch: 0 });

      map.setPaintProperty(selectedLot.id + "-fill", "fill-color", "#0080ff");
    }

    setSelectedLot(null);
  };

  const handleMapClick = useCallback(
    async (event) => {
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

  const addLotsToMap = (map: any, lots: any) => {
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

  const handleAddLot = (lotGeometry: any) => {
    console.log("handleAddLot", lotGeometry);
  };

  const fetchData = async () => {
    try {
      const allDocs = await db.allDocs({ include_docs: true });
      const fields = allDocs.rows.map((row) => row.doc);
      console.log("fields", fields);
      if (map) {
        addFieldsToMap(map, fields);
      }
    } catch (err) {
      console.error("Error fetching data from PouchDB", err);
    }
  };

  const onMapLoad = useCallback(
    (event) => {
      const map = event.target;
      setMap(map);
      if (!map.hasControl(draw)) {
        map.addControl(draw);
      }
    },
    [draw]
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
  };

  const handleCreateLot = () => {
    handleLocateField();
    console.log("handleCreateLot");

    setShowNewLot(true);
  };

  useEffect(() => {
    fetchData();
    return () => {
      if (map && map.hasControl(draw)) {
        map.removeControl(draw);
      }
    };
  }, [map, draw]);

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

  return (
    <>
      <MapComponent onMapLoad={onMapLoad} />

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
          map={map}
          draw={draw}
          db_fields={db}
          onClose={handleCloseNewField}
        />
      ) : null}

      {showNewLot ? (
        <NewLot
          map={map}
          draw={draw}
          db_fields={db}
          onClose={handleCloseNewLot}
          original_field_name={selectedField?.nombre}
        />
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
          map={map}
          draw={draw}
          onSaveLot={handleAddLot}
          handleCreateLot={handleCreateLot}
          handleCloseNewLot={handleCloseNewLot}
        />
      ) : null}

      {selectedLot && (
        <LotDetailsModal
          lot={selectedLot}
          isOpen={!!selectedLot}
          toggle={toggleLotDetailsModal}
        />
      )}
      <NewsBar />
    </>
  );
};
