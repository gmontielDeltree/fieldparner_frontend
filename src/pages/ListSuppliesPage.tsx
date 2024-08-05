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
  CardHeader,
} from "@mui/material";
import {
  Inventory as InventoryIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { DataGrid, GridColDef, GridRenderCellParams, esES } from "@mui/x-data-grid";
import { setSupplyActive } from "../redux/supply";
import { useTranslation } from "react-i18next";
import { TemplateLayout, Loading, CloseButtonPage } from "../components";
import { Supply } from "@types";
import * as XLSX from 'xlsx';

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

  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredSupplies);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Supplies");
    XLSX.writeFile(workbook, "supplies.xlsx");
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
        <Card elevation={5} sx={{ p: 2, boxShadow: '0 10px 20px rgba(0,0,0,0.2)', borderRadius: '16px' }}>
          <CardHeader
            avatar={<InventoryIcon sx={{ fontSize: 40, color: "#424242" }} />}
            title={
              <Typography component="h2" variant="h4" sx={{ fontWeight: 'bold', color: "#424242" }}>
                {t("_supplies")}
              </Typography>
            }
            action={<CloseButtonPage />}
          />
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={3}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<AddIcon />}
                  onClick={() => navigate("/init/overview/supply/new")}
                  sx={{
                    borderRadius: "30px",
                    fontWeight: 'bold',
                    background: 'linear-gradient(45deg, #388e3c 30%, #66bb6a 90%)',
                    transition: 'background 0.3s ease-in-out',
                    "&:hover": {
                      background: 'linear-gradient(45deg, #66bb6a 30%, #388e3c 90%)',
                    },
                  }}
                >
                  {t("new_masculine")}
                </Button>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label={t("supply_description")}
                  value={filterText}
                  onChange={handleFilterChange}
                  variant="outlined"
                  size="small"
                  fullWidth
                  sx={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderRadius: '8px',
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3} display="flex" justifyContent="flex-end">
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<DownloadIcon />}
                  onClick={handleExport}
                  sx={{
                    borderRadius: "30px",
                    paddingLeft: "30px",
                    paddingRight: "30px",
                    fontWeight: 'bold',
                    background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                    transition: 'background 0.3s ease-in-out',
                    "&:hover": {
                      background: 'linear-gradient(45deg, #42a5f5 30%, #1976d2 90%)',
                    },
                  }}
                >
                  {t("export")}
                </Button>
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
                        backgroundColor: "#424242", // Lighter gray
                        color: "#fff",
                        fontSize: '16px',
                        fontWeight: 'bold',
                      },
                      "& .MuiDataGrid-columnHeader:focus-within .MuiDataGrid-sortIcon": {
                        color: "#fff", // Arrow color when focused
                      },
                      "& .MuiDataGrid-sortIcon": {
                        color: "#fff", // Arrow color
                        fontSize: '1.5rem', // Increase arrow size
                        textShadow: '0px 0px 5px rgba(0,0,0,0.5)', // Add shadow to make it stand out
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
