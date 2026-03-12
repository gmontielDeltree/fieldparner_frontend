import { Box } from "@mui/material";
import { NavBar, SideBar } from "..";
import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector, useField } from "../../hooks";
import { uiOpenSideBard } from "../../redux/ui";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { useNavigate } from "react-router-dom";
import FieldsSideMenu from "../FieldsSideMenu";
import { Field } from "../../interfaces/field";

const drawerWidth = 280; //Ancho del sidebar en px;

export interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  // const [open, setOpen] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { openSideBar } = useAppSelector((state) => state.ui);
  const { fields, getFields } = useField();
  const isFieldsMenuVisible = useSelector((state: RootState) => state.fieldList.isVisible);

  // Load fields on mount for the global FieldsSideMenu
  useEffect(() => {
    getFields();
  }, [getFields]);

  const handleSideBarOpen = useCallback(() => {
    // setOpen(true);
    dispatch(uiOpenSideBard(true));
  }, []);

  const handleSideBarClose = useCallback(() => {
    // setOpen(false);
    dispatch(uiOpenSideBard(false));
  }, []);

  const handleSelectField = useCallback((field: Field) => {
    navigate(`/init/overview/fields/${field._id}`);
  }, [navigate]);

  const handleDirectLotSelection = useCallback((lot: any, field: Field) => {
    navigate(`/init/overview/fields/${field._id}/${lot.id}`);
  }, [navigate]);

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

      {/* Global FieldsSideMenu - available on all routes */}
      <FieldsSideMenu
        open={isFieldsMenuVisible}
        fields={fields as unknown as Field[]}
        onSelectField={handleSelectField}
        onSelectLot={handleDirectLotSelection}
      />

      <Box
        component="main"
        display="flex"
        id="app_layout_router_outlet"
        sx={{
          position: "relative",
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
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={true}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover
        theme="colored"
        limit={3}
      />
    </Box>
  );
};

export default AppLayout;