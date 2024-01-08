import React, { useState, useEffect } from "react";
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
  const [marker, setMarker] = useState<Marker | null>(null);
  const [lastKnownPosition, setLastKnownPosition] = useState(null);
  const map = useSelector(selectMap);

  useEffect(() => {
    if (map && selectedLot) {
      const centerOfLot = centroid(selectedLot.geometry).geometry.coordinates;

      // Determine the position to place the marker
      const position = lastKnownPosition || centerOfLot;

      // Create a new marker if one doesn't exist or if the draggable property changes
      if (!marker || marker.isDraggable() !== isDraggable) {
        if (marker) {
          // Remove the old marker if it exists
          marker.remove();
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

        setMarker(newMarker);
      }

      // Function to remove the marker
      const removeMarker = () => {
        console.log("Removing marker", marker);
        if (marker) {
          marker.remove();
          setMarker(null);
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
    }
  }, [map, selectedLot, isDraggable, onRemoveMarkers]); // Dependencies

  return <></>;
}

export default PlaceMarker;
