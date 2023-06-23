
import { Box, Container, Toolbar } from '@mui/material';
import { NavBar, SideBar } from '..';
import { useCallback, useState } from 'react';
import Map from 'react-map-gl';
import mapboxgl from 'mapbox-gl';

const drawerWidth = 240; //Ancho del sidebar en px;

const mapStyle: mapboxgl.Style = {
    version: 8,
    sources: {
        worldImagery: {
            type: "raster",
            tiles: [
                //"http://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}&s=Ga"
                //"https://ecn.t1.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=587&mkt=en-gb&n=z",
                "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            ],
            tileSize: 256,
        },
    },
    layers: [
        {
            id: "worldImagery",
            type: "raster",
            source: "worldImagery",
            minzoom: 0,
            maxzoom: 20,
        },
    ],
    // glyphs: "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
};

export interface AppLayoutProps {
    children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {

    const [open, setOpen] = useState<boolean>(false);

    const handleSideBarOpen = useCallback(() => {
        setOpen(true);
    }, []);

    const handleSideBarClose = useCallback(() => {
        setOpen(false);
    }, []);


    return (
        <Box sx={{ display: 'flex' }}>
            {/* <CssBaseline /> */}
            <NavBar
                drawerWidth={drawerWidth}
                open={open}
                handleSideBarOpen={handleSideBarOpen} />

            <SideBar
                drawerWidth={drawerWidth}
                open={open}
                handleSideBarClose={handleSideBarClose} />

            <Box
                component="main"
                display="flex"
                sx={{
                    width: '100%',
                    height: '100vh',
                    backgroundColor: '#f4f4f4',
                    flexGrow: 1,
                    ml: `-${drawerWidth}px`,
                    pt: '64px',
                    ...(open && { ml: 0 })
                }}>
                {/* <Toolbar className='pepe' /> */}
                <Box
                    component="div"
                    // display="inline-block"
                    sx={{
                        width: '45%',
                        height: '100%',
                        // maxWidth: 800,
                        p: 1,
                    }}>
                    {children}
                </Box>

                <Box
                    component="div"
                    display="inline-block"
                    sx={{
                        position: 'relative',
                        width: `calc(55% + ${open ? '0px' : '240px'})`,
                        height: '100%',
                    }}>
                    <Map
                        key="map-fieldpartner"
                        initialViewState={{
                            longitude: -59.2965,
                            latitude: -35.1923,
                            zoom: 14
                        }}
                        mapboxAccessToken='pk.eyJ1IjoibGF6bG9wYW5hZmxleCIsImEiOiJja3ZzZHJ0ZzYzN2FvMm9tdDZoZmJqbHNuIn0.oQI_TrJ3SvJ6e5S9_CnzFw'
                        style={{
                            width: '100%',
                            margin: 0,
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                        }}
                        mapStyle={mapStyle}
                    />
                </Box>
            </Box>

        </Box>
    );
}