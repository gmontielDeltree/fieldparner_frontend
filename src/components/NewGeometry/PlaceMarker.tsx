// PlaceMarker.tsx
import React, { useState, useEffect, useRef } from 'react'
import { Marker } from 'mapbox-gl'
import centroid from '@turf/centroid'
import { useSelector } from 'react-redux'
import { selectMap } from '../../redux/map/mapSlice'

function PlaceMarker({
  selectedLot,
  setCoordinates,
  isDraggable,
  onRemoveMarkers,
  moveToUserLocation = true,
}) {
  const [lastKnownPosition, setLastKnownPosition] = useState(null)
  const map = useSelector(selectMap)
  const markerRef = useRef<Marker | null>(null)

  // Cleanup function to remove marker
  const removeMarker = () => {
    if (markerRef.current) {
      markerRef.current.remove()
      markerRef.current = null
    }
  }

  useEffect(() => {
    if (map && selectedLot) {
      // Check if selectedLot.geometry exists before calling centroid
      let position;

      if (selectedLot.geometry) {
        try {
          const centerOfLot = centroid(selectedLot.geometry).geometry.coordinates
          position = lastKnownPosition || centerOfLot
        } catch (error) {
          console.error("Error calculating centroid:", error)
          // Use default position or first feature's position if available
          if (selectedLot.features && selectedLot.features.length > 0) {
            const firstValidPosition = selectedLot.features.find(
              feature => feature.properties?.posicion && Array.isArray(feature.properties.posicion)
            )?.properties?.posicion

            position = lastKnownPosition || firstValidPosition || [0, 0]
          } else {
            position = lastKnownPosition || [0, 0]
          }
        }
      } else if (selectedLot.features && selectedLot.features.length > 0) {
        // Try to use the position from the first feature with a valid position
        const firstValidPosition = selectedLot.features.find(
          feature => feature.properties?.posicion && Array.isArray(feature.properties.posicion)
        )?.properties?.posicion

        position = lastKnownPosition || firstValidPosition || [0, 0]
      } else {
        // Fallback to last known position or default coordinates
        position = lastKnownPosition || [0, 0]
      }

      if (
        !markerRef.current ||
        markerRef.current.isDraggable() !== isDraggable
      ) {
        removeMarker() // Clean up existing marker before creating a new one

        const markerColor = isDraggable ? '#40b1ce' : '#db5935'
        const newMarker = new Marker({
          draggable: isDraggable,
          color: markerColor,
        })
          .setLngLat(position)
          .addTo(map)

        newMarker.on('dragend', () => {
          const newPosition = newMarker.getLngLat().toArray()
          setCoordinates(newPosition)
          setLastKnownPosition(newPosition)
        })

        markerRef.current = newMarker

        // If we have coordinates, set them
        if (position && position.length === 2) {
          setCoordinates(position)
        }
      }
    }

    // Register cleanup function with parent component
    if (onRemoveMarkers) {
      onRemoveMarkers(removeMarker)
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      removeMarker()
    }
  }, [map, selectedLot, isDraggable, onRemoveMarkers, lastKnownPosition])

  // User location effect
  useEffect(() => {
    if (moveToUserLocation && navigator.geolocation && map) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = [
            position.coords.longitude,
            position.coords.latitude,
          ]
          if (markerRef.current) {
            markerRef.current.setLngLat(userLocation)
            setCoordinates(userLocation)
            setLastKnownPosition(userLocation)
          }
        },
        (error) => {
          console.error("Error getting user's location:", error)
        },
      )
    }
  }, [moveToUserLocation, map, setCoordinates])

  return null
}

export default PlaceMarker