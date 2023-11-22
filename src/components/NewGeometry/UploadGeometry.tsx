import React, { useState, useEffect } from "react";
import JSZip from "jszip";
import toGeoJSON from "togeojson";
import { FeatureCollection, Geometry, GeoJsonProperties } from "geojson";
import { Button, Input } from "reactstrap";

interface UploadGeometryProps {
  file: File | null;
  onGeoJSONProcessed?: (formattedData: FormattedData) => void;
}

interface FormattedData {
  field_name: string;
  geometry: FeatureCollection<Geometry, GeoJsonProperties>[];
}

function UploadGeometry({ file, onGeoJSONProcessed }: UploadGeometryProps) {
  const [geometryData, setGeometryData] = useState<FeatureCollection<
    Geometry,
    GeoJsonProperties
  > | null>(null);
  const [geometryName, setGeometryName] = useState("");
  const [showInputUI, setShowInputUI] = useState(false);

  const isSaveDisabled = !geometryName || !geometryData;

  useEffect(() => {
    if (file?.name.endsWith(".kml")) {
      processKMLFile(file);
    } else if (file?.name.endsWith(".kmz")) {
      processKMZFile(file);
    } else {
      console.log("Invalid file", file?.name);
      alert("Please upload a .kml or .kmz file!");
    }
  }, [file]);

  const saveGeometryAndName = () => {
    if (geometryData) {
      const formattedData: FormattedData = {
        field_name: geometryName,
        geometry: [geometryData]
      };

      setGeometryData(null);
      setShowInputUI(false);

      onGeoJSONProcessed?.(formattedData);
    }
  };

  const processKMLFile = async (file: File) => {
    console.log("Processing KML file", file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const parser = new DOMParser();
      const kml = parser.parseFromString(
        event.target.result as string,
        "text/xml"
      );
      const converted = toGeoJSON.kml(kml);

      setGeometryData(converted);
      setShowInputUI(true);
    };
    reader.readAsText(file);
  };

  const processKMZFile = async (file: File) => {
    console.log("Processing KMZ file", file.name);
    const zip = new JSZip();
    const content = await zip.loadAsync(file);
    const kmlKey = Object.keys(content.files).find((key) =>
      key.endsWith(".kml")
    );
    if (kmlKey) {
      const kmlContent = await content.files[kmlKey].async("text");
      const parser = new DOMParser();
      const kml = parser.parseFromString(kmlContent, "text/xml");
      const converted = toGeoJSON.kml(kml);
      setGeometryData(converted);
      setShowInputUI(true);
    } else {
      alert("No KML file found in the KMZ!");
    }
  };

  return (
    <div>
      {showInputUI && (
        <div style={footerContainerStyles}>
          <Input
            type="text"
            value={geometryName}
            onChange={(e) => setGeometryName(e.target.value)}
            placeholder="Nombre del campo"
            style={inputStyles}
          />
          <Button
            color="primary"
            onClick={saveGeometryAndName}
            disabled={isSaveDisabled}
            style={buttonStyles}
          >
            Guardar
          </Button>
        </div>
      )}
    </div>
  );
}

const footerContainerStyles: React.CSSProperties = {
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px",
  backgroundColor: "#f7f7f7",
  borderTop: "1px solid #e0e0e0"
};

const inputStyles: React.CSSProperties = {
  flex: 1,
  marginRight: "10px"
};

const buttonStyles: React.CSSProperties = {
  marginLeft: "10px"
};

export default UploadGeometry;
