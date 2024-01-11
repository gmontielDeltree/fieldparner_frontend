import React, { useState, useEffect, useRef } from "react";
import { Marker } from "mapbox-gl";
import centroid from "@turf/centroid";
import { useSelector } from "react-redux";
import { selectMap } from "../../redux/map/mapSlice";

function PlaceMarker({
  selectedLot,
  setCoordinates,
  isDraggable,
  onRemoveMarkers
}) {
  const [lastKnownPosition, setLastKnownPosition] = useState(null);
  const map = useSelector(selectMap);
  const markerRef = useRef<Marker | null>(null); // Ref to store the current marker

  useEffect(() => {
    if (map && selectedLot) {
      const centerOfLot = centroid(selectedLot.geometry).geometry.coordinates;
      const position = lastKnownPosition || centerOfLot;

      if (
        !markerRef.current ||
        markerRef.current.isDraggable() !== isDraggable
      ) {
        if (markerRef.current) {
          markerRef.current.remove();
        }

        const markerColor = isDraggable ? "#40b1ce" : "#db5935";
        const newMarker = new Marker({
          draggable: isDraggable,
          color: markerColor
        })
          .setLngLat(position)
          .addTo(map);

        newMarker.on("dragend", () => {
          const newPosition = newMarker.getLngLat().toArray() as [
            number,
            number
          ];
          setCoordinates(newPosition);
          setLastKnownPosition(newPosition);
        });

        markerRef.current = newMarker;
      }
    }

    // Function to remove the marker
    const removeMarker = () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    };

    // Listen for the tour save event
    if (onRemoveMarkers) {
      onRemoveMarkers(removeMarker);
    }

    // Clean-up function
    return () => {
      removeMarker();
    };
  }, [map, selectedLot, isDraggable, onRemoveMarkers]);

  return <></>;
}

export default PlaceMarker;
