import React, { useRef, useEffect, useState } from "react";
import Map, { Marker } from "react-map-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import { NavigationControl, GeolocateControl } from "mapbox-gl";

import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import "mapbox-gl/dist/mapbox-gl.css";

import "./MapComponent.css";

interface MapComponentProps {
    onMapLoad: (event: any) => void;
    selectedLocation?: { lat: number; lng: number };
    onLocationSelect?: (location: { lat: number; lng: number }) => void;
}

const get_initialVS = () => {
    let mp = localStorage.getItem("mapposition");
    if (mp) {
        let d = JSON.parse(mp);
        return { longitude: +d[0].lng, latitude: +d[0].lat, zoom: +d[1] };
    } else {
        return {
            longitude: -59.2965,
            latitude: -35.1923,
            zoom: 14,
        };
    }
};

const MapComponent: React.FC<MapComponentProps> = ({
    onMapLoad,
    selectedLocation,
    onLocationSelect
}) => {
    const mapboxAccessToken =
        "pk.eyJ1IjoibGF6bG9wYW5hZmxleCIsImEiOiJja3ZzZHJ0ZzYzN2FvMm9tdDZoZmJqbHNuIn0.oQI_TrJ3SvJ6e5S9_CnzFw";

    const mapRef = useRef(null);
    const geocoderRef = useRef(null);
    const [isMapLoaded, setIsMapLoaded] = useState(false);

    const navigationControlRef = useRef(null);
    const geolocateControlRef = useRef(null);

    const handleMapLoad = (event) => {
        onMapLoad(event);
        setIsMapLoaded(true);
    };

    useEffect(() => {
        if (isMapLoaded && mapRef.current) {
            const map = mapRef.current.getMap();

            if (!geocoderRef.current) {
                geocoderRef.current = new MapboxGeocoder({
                    accessToken: mapboxAccessToken,
                    mapboxgl: mapRef.current,
                    marker: false,
                });
                map.addControl(geocoderRef.current, "top-right");
            }

            if (!navigationControlRef.current) {
                navigationControlRef.current = new NavigationControl();
                map.addControl(navigationControlRef.current, "top-right");
            }

            if (!geolocateControlRef.current) {
                geolocateControlRef.current = new GeolocateControl();
                map.addControl(geolocateControlRef.current, "top-right");
            }

            if (onLocationSelect) {
                map.on('click', (e) => {
                    const newLocation = {
                        lat: e.lngLat.lat,
                        lng: e.lngLat.lng
                    };
                    onLocationSelect(newLocation);
                });
            }
        }

        return () => {
            if (mapRef.current) {
                const map = mapRef.current.getMap();
                if (geocoderRef.current) {
                    map.removeControl(geocoderRef.current);
                }
                if (navigationControlRef.current) {
                    map.removeControl(navigationControlRef.current);
                }
                if (geolocateControlRef.current) {
                    map.removeControl(geolocateControlRef.current);
                }

                if (onLocationSelect) {
                    map.off('click');
                }
            }
        };
    }, [isMapLoaded, onLocationSelect]);

    const [viewState, setViewState] = useState(get_initialVS());

    return (
        <Map
            ref={mapRef}
            onLoad={handleMapLoad}
            {...viewState}
            onMove={evt => setViewState(evt.viewState)}
            mapboxAccessToken={mapboxAccessToken}
            style={{
                width: "100%",
                height: "100%",
                position: "absolute",
            }}
            onMoveEnd={() => {
                if (mapRef.current) {
                    let center = mapRef.current.getCenter();
                    let zoom = mapRef.current.getZoom();
                    localStorage.setItem("mapposition", JSON.stringify([center, zoom]));
                }
            }}
            mapStyle="mapbox://styles/mapbox/satellite-streets-v12?optimize=true"
        >
            {selectedLocation && (
                <Marker
                    longitude={selectedLocation.lng}
                    latitude={selectedLocation.lat}
                    color="#FF0000"
                />
            )}
        </Map>
    );
};

export default MapComponent;