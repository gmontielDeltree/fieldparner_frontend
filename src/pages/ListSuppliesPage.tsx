import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useSupply } from "../hooks";
import {
  Container,
  Box,
  Button,
  Typography,
  IconButton,
  Tooltip,
  TextField,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import {
  Inventory as InventoryIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { DataGrid, GridColDef, GridRenderCellParams, esES } from "@mui/x-data-grid";
import { setSupplyActive } from "../redux/supply";
import { useTranslation } from "react-i18next";
import { TemplateLayout, Loading, CloseButtonPage } from "../components";
import { Supply } from "@types";

export const ListSuppliesPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const { isLoading, supplies, getSupplies, deleteSupply } = useSupply();
  const [filterText, setFilterText] = useState("");
  const [filteredSupplies, setFilteredSupplies] = useState(supplies);

  useEffect(() => {
    getSupplies();
  }, []);

  useEffect(() => {
    setFilteredSupplies(supplies);
  }, [supplies]);

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFilterText(value);
    handleSearch(value);
  };

  const handleSearch = (searchText: string) => {
    const filtered = supplies.filter((supply) =>
      Object.values(supply).some((value) =>
        value !== null && value !== undefined && value.toString().toLowerCase().includes(searchText.toLowerCase())
      )
    );
    setFilteredSupplies(filtered);
  };

  const handleUpdateSupply = (item: Supply) => {
    navigate(`/init/overview/supply/${item._id}`);
    dispatch(setSupplyActive(item));
  };

  const handleDeleteSupply = (item: Supply) => {
    if (item._id && item._rev) {
      deleteSupply(item._id, item._rev);
      getSupplies();
    }
  };

  const columns: GridColDef[] = [
    { field: "type", headerName: t("_type"), flex: 1 },
    { field: "name", headerName: t("_supply"), flex: 1 },
    { field: "unitMeasurement", headerName: t("unit_of_measure"), flex: 1 },
    { field: "currentStock", headerName: t("current_stock"), flex: 1 },
    { field: "reservedStock", headerName: t("reserved_stock"), flex: 1 },
    { field: "brand", headerName: t("brand"), flex: 1 },
    {
      field: "actions",
      headerName: "",
      flex: 1,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box display="flex" justifyContent="center">
          <Tooltip title={t("icon_edit")}>
            <IconButton
              aria-label={t("icon_edit")}
              onClick={() => handleUpdateSupply(params.row)}
              sx={{
                transition: "transform 0.2s",
                "&:hover": { transform: "scale(1.2)" },
              }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t("icon_delete")}>
            <IconButton
              aria-label={t("icon_delete")}
              onClick={() => handleDeleteSupply(params.row)}
              sx={{
                transition: "transform 0.2s",
                "&:hover": { transform: "scale(1.2)" },
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <TemplateLayout key="overview-supplies" viewMap={false}>
      {isLoading && <Loading loading />}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Card elevation={3} sx={{ p: 2, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <Box display="flex" alignItems="center">
                  <InventoryIcon sx={{ marginRight: "8px", fontSize: 32, color: "#388e3c" }} />
                  <Typography component="h2" variant="h4" sx={{ fontWeight: 'bold', color: "#388e3c" }}>
                    {t("_supplies")}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4} textAlign={{ xs: "right", md: "right" }}>
                <CloseButtonPage />
              </Grid>
              <Grid item xs={12} md={8}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<AddIcon />}
                  onClick={() => navigate("/init/overview/supply/new")}
                  sx={{ borderRadius: "20px", fontWeight: 'bold' }}
                >
                  {t("new_masculine")}
                </Button>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label={t("supply_description")}
                  value={filterText}
                  onChange={handleFilterChange}
                  variant="outlined"
                  size="small"
                  fullWidth
                  sx={{ backgroundColor: 'white', borderRadius: '4px' }}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ height: 600, width: "100%", mt: 2 }}>
                  <DataGrid
                    rows={filteredSupplies}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10]}
                    disableSelectionOnClick
                    loading={isLoading}
                    getRowId={(row) => row._id}
                    localeText={esES.components.MuiDataGrid.defaultProps.localeText}
                    sx={{
                      "& .MuiDataGrid-columnHeaders": {
                        backgroundColor: "#388e3c",
                        color: "#fff",
                        fontSize: '16px',
                        fontWeight: 'bold',
                      },
                      "& .MuiDataGrid-cell": {
                        borderBottom: "none",
                        color: '#333',
                      },
                      "& .MuiDataGrid-row:nth-of-type(odd)": {
                        backgroundColor: "#f9f9f9",
                      },
                      "& .MuiDataGrid-row:hover": {
                        backgroundColor: "#e8f5e9",
                      },
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </TemplateLayout>
  );
};
