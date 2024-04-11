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
import { ColumnProps, Zones } from "../types";
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
  Map as MapIcon,
} from "@mui/icons-material";
import { useForm, useAppDispatch, useAppSelector, useZones } from "../hooks";
import { useTranslation } from "react-i18next";
import { setZoneActive } from "../redux/zones";



export const ListZonesPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
const {t} = useTranslation();
  const { isLoading } = useAppSelector((state) => state.ui);
  const { zones, getZones,removeZone } = useZones();
  const { filterText, handleInputChange } = useForm({ filterText: "" });


  const columns: ColumnProps[] = [
    { text: t("_zone"), align: "center" },
    { text: t("description"), align: "center" },
    { text: "", align: "center" }
  ];



  const onClickAddZone = () => navigate("/init/overview/zones/new");

  const handleDeleteZone = (item:Zones) => {
    if (item._id && item._rev) {
      removeZone (item._id, item._rev);
      getZones();
    }
  };

  const onClickUpdateZone = (item: Zones): void => {
    dispatch(setZoneActive(item));
    navigate(`/init/overview/zones/${item._id}`);
  };

  useEffect(() => {
    getZones();
  }, []);

  function onClickBuscar(): void {
    throw new Error("Function not implemented.");
  }

  return (
    <TemplateLayout key="overview-zones" viewMap={true}>
      {isLoading && <Loading loading={true} />}
      <Box
        component="div"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ ml: { sm: 2 }, pt: 2, pr: 2 }}
      >
        <Box display="flex" alignItems="center">
          <MapIcon sx={{ marginRight: '8px' }} />
          <Typography component="h2" variant="h4" sx={{ ml: { sm: 2 } }}>
            {t("_zones")}
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
              onClick={onClickAddZone}
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
                  placeholder={t("zone_description")}
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
                  onClick={() => onClickBuscar()}
                  startIcon={<SearchIcon />}
                >
                  {t("icon_search")}
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Box component="div" sx={{ p: 1 }}>
          <DataTable
            key="datatable-zones"
            columns={columns}
            isLoading={isLoading}
          >
            {zones.map((row) => (
              <ItemRow>
                <TableCellStyled align="center">{row.zone} </TableCellStyled>
                <TableCellStyled align="center">{row.description}</TableCellStyled>
                <TableCellStyled align="center">
                  <Tooltip title={t("icon_edit")}>
                    <IconButton
                      aria-label={t("icon_edit")}
                      onClick={() => onClickUpdateZone(row)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t("icon_delete")}>
                  <IconButton onClick={() => handleDeleteZone(row)} style={{ fontSize: '1rem' }}>
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
