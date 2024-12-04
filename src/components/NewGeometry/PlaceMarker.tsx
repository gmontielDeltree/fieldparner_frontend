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
      const centerOfLot = centroid(selectedLot.geometry).geometry.coordinates
      const position = lastKnownPosition || centerOfLot

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
