import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Map as MapboxMap } from "mapbox-gl";
import MapboxDraw, { constants } from "@mapbox/mapbox-gl-draw";
import { FeatureCollection, Geometry, GeoJsonProperties } from "geojson";
import { Button, Input, Row, Col, Container } from "reactstrap";
import { useSelector } from "react-redux";
import { selectMap } from "../../redux/map/mapSlice";
import { selectDraw } from "../../redux/draw/drawSlice";
import { CloseButtonBack } from "../Basic/CloseButtonBack";
import { type } from "../../interfaces/contractor";
import { features } from "process";

interface DrawGeometryProps {
  handleSaveGeometry?: (formattedData: FormattedData) => void;
  type: "field" | "lot",
  initialGeometry ?: FeatureCollection,
  initialName ?: string,
  edit ?: boolean
}

interface FormattedData {
  field_name: string;
  geometry: FeatureCollection<Geometry, GeoJsonProperties>[];
}

/* Esto es para evitar salir del Simple Select cuando se cierra un poligono */
MapboxDraw.modes.direct_select.onTrash = function (state) {
  if (state.selectedCoordPaths.length === 0) {
    this.deleteFeature(state.featureId);
    this.changeMode(constants.modes.SIMPLE_SELECT, {});
  } else {
    // Uses number-aware sorting to make sure '9' < '10'. Comparison is reversed because we want them
    // in reverse order so that we can remove by index safely.
    state.selectedCoordPaths
      .sort((a, b) => b.localeCompare(a, "en", { numeric: true }))
      .forEach((id) => state.feature.removeCoordinate(id));
    this.fireUpdate();
    state.selectedCoordPaths = [];
    this.clearSelectedCoordinates();
    this.fireActionable(state);
    if (state.feature.isValid() === false) {
      this.deleteFeature([state.featureId]);
      this.changeMode(constants.modes.SIMPLE_SELECT, {});
    }
  }
};

function DrawGeometry2({ handleSaveGeometry, type, initialGeometry, initialName, edit }: DrawGeometryProps) {
  const [geometryName, setGeometryName] = useState(initialName || "");
  const [geometryData, setGeometryData] = useState<FeatureCollection<
    Geometry,
    GeoJsonProperties
  > | null>(initialGeometry || null);

  const map: MapboxMap = useSelector(selectMap);

  // Local Draw Control
  const [draw, setDraw] = useState<MapboxDraw>(
    new MapboxDraw({
      displayControlsDefault: false,
      // Select which mapbox-gl-draw control buttons to add to the map.
      controls: {
        trash: true,
      },
      // Set mapbox-gl-draw to draw by default.
      // The user does not have to click the polygon control button first.
      defaultMode: "draw_polygon",
    }),
  );


const isValidShape =()=>{
return true
}

  //useSelector(selectDraw);
  const isSaveDisabled = !geometryName || !geometryData || !isValidShape();

  const typeName = type === "field" ? "campo" : "lote";


  const onDelete = useCallback(() => {
    console.log("draw.delete event");
    setGeometryData(null);
    draw.changeMode("draw_polygon");
  }, []);

  const onUnmount = useCallback(() => {
    map.removeControl(draw);
    map.off("draw.delete", onDelete);
    map.off("draw.create", handleDrawComplete);
    map.off("draw.selectionchange", backToSimpleSelect);
    map.off("draw.modechange", backToSimpleSelect);
    map.off("draw.update", drawUpdate);
  }, [map]);

  const handleDrawComplete = useCallback((event: any) => {
    if (event.features && event.features.length > 0) {
      console.log("draw.create event", draw.getAll());

      setGeometryData(draw.getAll());
    }
  }, []);

  const drawUpdate = useCallback((event) => {
    if (event.features && event.features.length > 0) {
      console.log("draw.create event", draw.getAll());

      setGeometryData(draw.getAll());
    }
  }, []);

  const backToSimpleSelect = useCallback((event) => {
    console.log("draw.selectionchange event", event, draw.getAll());

    // Go back to simple_select if deselected (from selectionchange)
    if (event.features?.length === 0) {
      if (draw.getAll().features.length > 0) {
        console.log("back to simple_select from selectionchange");

        draw.changeMode("simple_select", {
          featureIds: [draw.getAll().features[0].id],
        });
        return;
      }
    }

    // Go back to simple_select if deselected (from modechange)
    if (event.mode === "simple_select") {
      if (draw.getAll().features.length > 0) {
        console.log("back to simple_select from modechange");
        draw.changeMode("simple_select", {
          featureIds: [draw.getAll().features[0].id],
        });
        return;
      }
    }

    if (draw.getMode() === "direct_select") {
      console.log("direct_select borrar");
    }
  }, []);

  /* reestablecer modo, puntero y mapa al unmount */
  useEffect(() => {
    return onUnmount;
  }, []);

  useEffect(() => {
    if (map) {
      map.addControl(draw);
      map.on("draw.delete", onDelete);
      map.on("draw.create", handleDrawComplete);
      map.on("draw.modechange", backToSimpleSelect);
      map.on("draw.selectionchange", backToSimpleSelect);
      map.on("draw.update", drawUpdate);

      if(initialGeometry){
        
        draw.add(initialGeometry)
        console.log("initial geom",draw.getAll())
        draw.changeMode("simple_select", {
          featureIds: [draw.getAll().features[1].id],
        });
      
        
      }
    }
  }, [map]);

  const saveGeometryAndName = () => {
    if (geometryData) {
      const formattedData: FormattedData = {
        field_name: geometryName,
        geometry: [geometryData],
      };

      draw.deleteAll();
      if (draw && draw.changeMode) {
        draw.changeMode("draw_polygon");
      } else {
        console.error("draw object or changeMode method not available");
      }

      // draw.changeMode("direct_select",{featureId:});

      handleSaveGeometry?.(formattedData);
    }
  };

  const containerStyles: React.CSSProperties = {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#f7f7f7",
    padding: "10px",
  };

  return (
    <div style={containerStyles}>
      <Container fluid style={{ paddingBottom: "20px" }}>
        <Row>
          <Col md="9">
            <Input
              type="text"
              value={geometryName}
              onChange={(e) => setGeometryName(e.target.value)}
              placeholder={"Nombre del " + typeName}
            />
          </Col>

          <Col md="1">
            <CloseButtonBack />
          </Col>

          <Col md="2">
            <Button
              color="primary"
              onClick={saveGeometryAndName}
              disabled={isSaveDisabled}
              style={{ opacity: isSaveDisabled ? 0.5 : 1 }}
            >
              Guardar
            </Button>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default DrawGeometry2;
