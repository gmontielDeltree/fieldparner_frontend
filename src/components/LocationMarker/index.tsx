import React, { useEffect, useState } from 'react';
import { Marker } from 'react-map-gl';
import { useMapContext } from '../../components/TemplateLayout';

interface LocationMarkerProps {
    position: { lat: number; lng: number };
    onChange: (position: { lat: number; lng: number }) => void;
    draggable?: boolean;
}

// Componente que añade un marcador al mapa para representar la ubicación seleccionada
const LocationMarker: React.FC<LocationMarkerProps> = ({
    position,
    onChange,
    draggable = true
}) => {
    const { map } = useMapContext();
    const [markerPosition, setMarkerPosition] = useState(position);

    // Actualizar la posición del marcador cuando cambia la prop position
    useEffect(() => {
        setMarkerPosition(position);
    }, [position]);

    // Manejar cuando el marcador se arrastra
    const handleDragEnd = (event) => {
        const { lngLat } = event;
        const newPosition = {
            lat: lngLat.lat,
            lng: lngLat.lng
        };

        setMarkerPosition(newPosition);
        onChange(newPosition);
    };

    useEffect(() => {
        if (map && draggable) {
            const handleMapClick = (e) => {
                const newPosition = {
                    lat: e.lngLat.lat,
                    lng: e.lngLat.lng
                };

                setMarkerPosition(newPosition);
                onChange(newPosition);
            };

            map.on('click', handleMapClick);

            return () => {
                map.off('click', handleMapClick);
            };
        }
    }, [map, draggable, onChange]);

    return (
        <Marker
            latitude={markerPosition.lat}
            longitude={markerPosition.lng}
            draggable={draggable}
            onDragEnd={handleDragEnd}
            color="#F00"
        />
    );
};

export default LocationMarker;