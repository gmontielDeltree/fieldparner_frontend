import React, { useState, useEffect, useRef } from "react";
import { Marker } from "mapbox-gl";
import centroid from "@turf/centroid";
import { useSelector } from "react-redux";
import { selectMap } from "../../redux/map/mapSlice";

function PlaceMarker({
  selectedLot,
  setCoordinates,
  isDraggable,
  onRemoveMarkers,
  moveToUserLocation = true 
}) {
  const [lastKnownPosition, setLastKnownPosition] = useState(null);
  const map = useSelector(selectMap);
  const markerRef = useRef<Marker | null>(null);

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
          const newPosition = newMarker.getLngLat().toArray();
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

    if (onRemoveMarkers) {
      onRemoveMarkers(removeMarker);
    }
  }, [map, selectedLot, isDraggable, onRemoveMarkers, lastKnownPosition]);

  // New useEffect hook to move marker to user's location
  useEffect(() => {
    if (moveToUserLocation && navigator.geolocation) {
      console.log("Getting user's location...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = [
            position.coords.longitude,
            position.coords.latitude
          ];
          if (markerRef.current) {
            markerRef.current.setLngLat(userLocation);
            setCoordinates(userLocation);
            setLastKnownPosition(userLocation);
          } else {
            // If marker doesn't exist, create a new one at user's location
            const markerColor = isDraggable ? "#40b1ce" : "#db5935";
            const newMarker = new Marker({
              draggable: isDraggable,
              color: markerColor
            })
              .setLngLat(userLocation)
              .addTo(map);

            newMarker.on("dragend", () => {
              const newPosition = newMarker.getLngLat().toArray();
              setCoordinates(newPosition);
              setLastKnownPosition(newPosition);
            });

            markerRef.current = newMarker;
          }
        },
        (error) => {
          console.error("Error getting user's location:", error);
        }
      );
    }
  }, [moveToUserLocation, isDraggable, map, setCoordinates]);

  return <></>;
}

export default PlaceMarker;
