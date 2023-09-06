import { Box } from "@mui/material";
import { NavBar, SideBar } from "..";
import { useCallback, useState } from "react";
// import Map from "react-map-gl";
// import mapboxgl from "mapbox-gl";
// import { LocalizationProvider } from "@mui/x-date-pickers";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const drawerWidth = 240; //Ancho del sidebar en px;

// const mapStyle: mapboxgl.Style = {
//   version: 8,
//   sources: {
//     worldImagery: {
//       type: "raster",
//       tiles: [
//         //"http://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}&s=Ga"
//         //"https://ecn.t1.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=587&mkt=en-gb&n=z",
//         "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
//       ],
//       tileSize: 256,
//     },
//   },
//   layers: [
//     {
//       id: "worldImagery",
//       type: "raster",
//       source: "worldImagery",
//       minzoom: 0,
//       maxzoom: 20,
//     },
//   ],
//   // glyphs: "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
// };

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
    <Box sx={{ display: "flex" }}>
      {/* <CssBaseline /> */}
      <NavBar
        drawerWidth={drawerWidth}
        open={open}
        handleSideBarOpen={handleSideBarOpen}
      />

      <SideBar
        drawerWidth={drawerWidth}
        open={open}
        handleSideBarClose={handleSideBarClose}
      />

      <Box
        component="main"
        display="flex"
        sx={{
          width: "100%",
          height: "100vh",
          backgroundColor: "#f4f4f4",
          flexGrow: 1,
          ml: `-${drawerWidth}px`,
          pt: "64px",
          ...(open && { ml: 0 }),
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
