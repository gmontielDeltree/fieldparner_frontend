import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Loading,
  TemplateLayout,
  DataTable,
  ItemRow,
  TableCellStyled,
  CloseButtonPage,
} from "../components";
import { ColumnProps, OriginDestinations } from "../types";
import {
  Box,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import 'semantic-ui-css/semantic.min.css';
import {Icon} from "semantic-ui-react";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  AddLocationAlt as AddLocationAltIcon,
  ArrowRightAlt as ArrowRightAltIcon,
} from "@mui/icons-material";
import { useForm, useAppDispatch, useAppSelector, useOriginDestinations } from "../hooks";
import {  setOriginsDestinationsActive } from "../redux/originsdestinatons/originDestiantionsSlice";
import { useTranslation } from "react-i18next";


export const ListOriginsDestinationsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.ui);
  const { originsDestinations, getOriginDestinations, removeOriginDestinations, searchOriginDestinations, } = useOriginDestinations();
  const { filterText, handleInputChange } = useForm({ filterText: "" });
  const {t} =useTranslation();
  
  const columns: ColumnProps[] = [
    { text: t("_type"), align: "center" },
    { text: t("_description"), align: "center" },
    { text: t("_geolocation"), align: "center" },
    { text: "", align: "right" },
  ];

  

  const onClickAddOriginsDestinations = () => navigate("/init/overview/origins-destinations/new");

  const onClickUpdateOriginsDestinations = (item: OriginDestinations): void => {
    dispatch(setOriginsDestinationsActive(item));
    navigate(`/init/overview/origins-destinations/${item._id}`);
  };

  const handleDeleteOriginsDestinations = (item:OriginDestinations) => {
    if (item._id && item._rev) {
      removeOriginDestinations (item._id, item._rev);
      getOriginDestinations();
    }
  };

  const onClickSearch = () => {
    if (filterText === "") {
      alert(t("please_enter_search_term"));
      return;
    }
    searchOriginDestinations(filterText);
  };

  useEffect(() => {
    
    getOriginDestinations();
  }, []);


  return (
    <TemplateLayout key="overview-origins-destinations" viewMap={true}>
      {isLoading && <Loading loading={true} />}
      <Box
        component="div"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ ml: { sm: 2 }, pt: 2, pr: 2 }}
      >
        <Box display="flex" alignItems="center">
          <AddLocationAltIcon sx={{ marginRight: '8px' }} /><ArrowRightAltIcon fontSize='large' />
          <Typography component="h2" variant="h4" sx={{ ml: { sm: 2 } }}>
          {t("origins_destinations")}
          </Typography>
        </Box>
        <CloseButtonPage />
      </Box>
      <Box component="div" sx={{ mt: 7 }}>
        <Grid
          container
          spacing={0}
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ p: 2, mt: { sm: 2 } }}
        >
          <Grid item xs={6} sm={2}>
            <Button
              variant="contained"
              color="success"
              startIcon={<AddIcon />}
              onClick={onClickAddOriginsDestinations}
            >
              {t("add_new")}
            </Button>
          </Grid>
          <Grid item xs={12} sm={10}>
            <Grid container justifyContent="flex-end">
              <Grid item xs={8} sm={7}>
                <TextField
                  variant="outlined"
                  type="text"
                  size="small"
                  placeholder={t("origin_destination")}
                  autoComplete="off"
                  name="filterText"
                  value={filterText}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start" />,
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={4} sm={3}>
                <Button
                  variant="contained"
                  color="primary"
                  size="medium"
                  fullWidth
                  sx={{
                    height: "98%",
                    margin: "auto",
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                  }}
                  onClick={() => onClickSearch ()}
                  startIcon={<SearchIcon />}
                >
                  {t("icon_search")}
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Box component="div" sx={{ p: 0 }}>
        <DataTable key="datatable-origins-destinations" columns={columns} isLoading={isLoading}>
          {originsDestinations.map((row) => (
            <ItemRow key={row._id}>
              <TableCellStyled align="center">{row.destino ? 'Destino' : row.procedencia ? 'Procedencia' : ''}</TableCellStyled>
              <TableCellStyled align="center">{row.name}</TableCellStyled>
              <TableCellStyled align="center">{row.description}</TableCellStyled>
              <TableCellStyled align="right">
                <Tooltip title={t("icon_edit")}>
                  <IconButton aria-label={t("icon_edit")} onClick={() => onClickUpdateOriginsDestinations(row)}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t("icon_delete")}>
                  <IconButton onClick={() => handleDeleteOriginsDestinations(row)} style={{ fontSize: '1rem' }}>
                    <Icon name="trash alternate" />
                  </IconButton>
                </Tooltip>
              </TableCellStyled>
            </ItemRow>
          ))}
        </DataTable>
        </Box>
      </Box>
    </TemplateLayout>
  );
};
