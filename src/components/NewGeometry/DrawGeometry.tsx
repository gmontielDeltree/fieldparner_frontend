import React, { useState, useEffect } from "react";
import { Map } from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { FeatureCollection, Geometry, GeoJsonProperties } from "geojson";
import { Button, Input, Row, Col, Container } from "reactstrap";

interface DrawGeometryProps {
  map: Map;
  draw: MapboxDraw;
  handleSaveGeometry?: (formattedData: FormattedData) => void;
  type: "field" | "lot";
}

interface FormattedData {
  field_name: string;
  geometry: FeatureCollection<Geometry, GeoJsonProperties>[];
}

function DrawGeometry({
  map,
  draw,
  handleSaveGeometry,
  type
}: DrawGeometryProps) {
  const [geometryName, setGeometryName] = useState("");
  const [geometryData, setGeometryData] = useState<FeatureCollection<
    Geometry,
    GeoJsonProperties
  > | null>(null);

  const isSaveDisabled = !geometryName || !geometryData;

  const typeName = type === "field" ? "campo" : "lote";
  useEffect(() => {
    const handleDrawComplete = (event: any) => {
      if (event.features && event.features.length > 0) {
        setGeometryData(draw.getAll());
      }
    };

    map.on("draw.create", handleDrawComplete);
    draw.changeMode("draw_polygon");

    return () => {
      map.off("draw.create", handleDrawComplete);
    };
  }, [map, draw]);

  const saveGeometryAndName = () => {
    if (geometryData) {
      const formattedData: FormattedData = {
        field_name: geometryName,
        geometry: [geometryData]
      };

      draw.deleteAll();
      draw.add(geometryData);
      draw.changeMode("simple_select");

      handleSaveGeometry?.(formattedData);
    }
  };

  const containerStyles: React.CSSProperties = {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#f7f7f7",
    padding: "10px"
  };

  return (
    <div style={containerStyles}>
      <Container fluid style={{ paddingBottom: "20px" }}>
        <Row>
          <Col md="10">
            <Input
              type="text"
              value={geometryName}
              onChange={(e) => setGeometryName(e.target.value)}
              placeholder={"Nombre del " + typeName}
            />
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

export default DrawGeometry;
