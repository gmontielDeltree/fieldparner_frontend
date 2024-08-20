import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
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
  Container,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { DataGrid, GridColDef, GridRenderCellParams, esES } from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";
import { TemplateLayout, Loading, CloseButtonPage } from "../components";
import * as XLSX from 'xlsx';

interface GenericListPageProps<T> {
  title: string;
  icon: React.ReactNode;
  data: T[];
  columns: GridColDef[];
  getData: () => void;
  deleteData: (id: string, rev: string) => void;
  setActiveItem: (item: T) => void;
  newItemPath: string;
  editItemPath: (id: string) => string;
}

export const GenericListPage = <T extends { _id?: string; _rev?: string }>({
  title,
  icon,
  data,
  columns,
  getData,
  deleteData,
  setActiveItem,
  newItemPath,
  editItemPath,
}: GenericListPageProps<T>) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [filterText, setFilterText] = useState("");
  const [filteredData, setFilteredData] = useState(data);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    getData();
    setIsLoading(false);
  }, [getData]);

  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFilterText(value);
    handleSearch(value);
  };

  const handleSearch = (searchText: string) => {
    const filtered = data.filter((item) =>
      Object.values(item).some((value) =>
        value !== null && value !== undefined && value.toString().toLowerCase().includes(searchText.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };

  const handleUpdateItem = (item: T) => {
    setActiveItem(item);
    navigate(editItemPath(item._id));
  };

  const handleDeleteItem = (item: T) => {
    deleteData(item._id, item._rev);
    getData();
  };

  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, title);
    XLSX.writeFile(workbook, `${title}.xlsx`);
  };

  return (
    <TemplateLayout key={`overview-${title}`} viewMap={false}>
      {isLoading && <Loading loading />}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Card elevation={5} sx={{ p: 2, boxShadow: '0 10px 20px rgba(0,0,0,0.2)', borderRadius: '16px' }}>
          <CardHeader
            avatar={icon}
            title={
              <Typography component="h2" variant="h4" sx={{ fontWeight: 'bold', color: "#424242" }}>
                {title}
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
                  onClick={() => navigate(newItemPath)}
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
                  {t("add_new")}
                </Button>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label={t("search")}
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
                    rows={filteredData}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10]}
                    disableSelectionOnClick
                    loading={isLoading}
                    getRowId={(row) => row._id}
                    localeText={esES.components.MuiDataGrid.defaultProps.localeText}
                    sx={{
                      "& .MuiDataGrid-columnHeaders": {
                        backgroundColor: "#424242",
                        color: "#fff",
                        fontSize: '16px',
                        fontWeight: 'bold',
                      },
                      "& .MuiDataGrid-columnHeader:focus-within .MuiDataGrid-sortIcon": {
                        color: "#fff",
                      },
                      "& .MuiDataGrid-sortIcon": {
                        color: "#fff",
                        fontSize: '1.5rem',
                        textShadow: '0px 0px 5px rgba(0,0,0,0.5)',
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
