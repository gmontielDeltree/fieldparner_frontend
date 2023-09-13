import { Box } from "@mui/material";
import { NavBar, SideBar } from "..";
import { useCallback, useState } from "react";

const drawerWidth = 240; //Ancho del sidebar en px;

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
