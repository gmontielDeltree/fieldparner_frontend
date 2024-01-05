import { Box } from "@mui/material";
import { NavBar, SideBar } from "..";
import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { uiOpenSideBard } from "../../redux/ui";

const drawerWidth = 280; //Ancho del sidebar en px;

export interface AppLayoutProps {
    children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  // const [open, setOpen] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const { openSideBar } = useAppSelector((state) => state.ui);

  const handleSideBarOpen = useCallback(() => {
    // setOpen(true);
    dispatch(uiOpenSideBard(true));
  }, []);

  const handleSideBarClose = useCallback(() => {
    // setOpen(false);
    dispatch(uiOpenSideBard(false));
  }, []);

  return (
    <Box sx={{ display: "flex" }}>
      {/* <CssBaseline /> */}
      <NavBar
        drawerWidth={drawerWidth}
        open={openSideBar}
        handleSideBarOpen={handleSideBarOpen}
      />

      <SideBar
        drawerWidth={drawerWidth}
        open={openSideBar}
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
          ...(openSideBar && { ml: 0 }),
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
