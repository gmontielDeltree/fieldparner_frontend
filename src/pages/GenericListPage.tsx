import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  TextField,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Container,
  Snackbar,
  Alert,
  AlertColor,
} from "@mui/material";
import {
  Add as AddIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { DataGrid, GridColDef, esES } from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";
import { TemplateLayout, Loading, CloseButtonPage } from "../components";
import * as XLSX from 'xlsx';

interface GenericListPageProps<T> {
  title: string;
  icon: React.ReactNode;
  data: T[];
  columns: GridColDef[];
  showAddButton?: boolean;
  getData: () => void;
  deleteData: (id: string, rev: string) => void;
  setActiveItem: (item: T) => void;
  newItemPath: string;
  editItemPath: (id: string) => string;
  isLoading: boolean;
  headerContent?: React.ReactNode;  // New prop for header content
  footerContent?: React.ReactNode;  // New prop for footer content
}

export const GenericListPage = <T extends { _id?: string; _rev?: string }>({
  title,
  icon,
  data,
  columns,
  getData,
  deleteData,
  showAddButton = true,
  setActiveItem,
  newItemPath,
  editItemPath,
  isLoading,
  headerContent,  // New prop
  footerContent,  // New prop
}: GenericListPageProps<T>) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [filterText, setFilterText] = useState("");
  const [filteredData, setFilteredData] = useState<(T & { id: string })[]>([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as AlertColor,
  });

  // Function to assign unique IDs to rows
  const assignUniqueIds = (items: T[]): (T & { id: string })[] => {
    return items.map((item, index) => ({
      ...item,
      id: item._id || `generated-id-${index}`,
    }));
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    const dataWithIds = assignUniqueIds(data);
    setFilteredData(dataWithIds);
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
    setFilteredData(assignUniqueIds(filtered));
  };

  const handleExport = () => {
    try {
      const sanitizedTitle = title
        .replace(/[\\\/\?\*\[\]\:\s]/g, '_')
        .substring(0, 31);

      const worksheet = XLSX.utils.json_to_sheet(filteredData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, sanitizedTitle);
      XLSX.writeFile(workbook, `${title}.xlsx`);

      setSnackbar({
        open: true,
        message: t('export_success', 'Archivo exportado exitosamente'),
        severity: 'success',
      });
    } catch (error) {
      console.error('Error al exportar:', error);
      setSnackbar({
        open: true,
        message: t('export_error', 'Error al exportar el archivo'),
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
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
            {headerContent && (  // Render header content if provided
              <Box mb={3}>
                {headerContent}
              </Box>
            )}
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={3}>
                {showAddButton && newItemPath && (
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
                )}
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
            {footerContent && (  // Render footer content if provided
              <Box mt={3}>
                {footerContent}
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>

      <Snackbar
  open={snackbar.open}
  autoHideDuration={4000}
  onClose={handleCloseSnackbar}
  anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
  sx={{
    '& .MuiAlert-root': {
      backdropFilter: 'blur(8px)',
      backgroundColor: 'rgba(255, 255, 255, 0.95)', // Aumentado la opacidad
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '12px',
      '& .MuiAlert-icon': {
        fontSize: '24px',
      },
      '& .MuiAlert-message': {
        fontSize: '14px',
        fontWeight: 500,
        color: '#000', // Asegurando que el texto sea negro
      },
    },
  }}
>
  <Alert
    onClose={handleCloseSnackbar}
    severity={snackbar.severity}
    variant="standard"
    elevation={6}
    sx={{
      width: '100%',
      animation: 'slideIn 0.5s ease-out',
      '@keyframes slideIn': {
        from: {
          transform: 'translateX(100%)',
          opacity: 0,
        },
        to: {
          transform: 'translateX(0)',
          opacity: 1,
        },
      },
      '&.MuiAlert-standardSuccess': {
        backgroundColor: '#e8f5e9', 
        color: '#2e7d32', 
        '& .MuiAlert-icon': {
          color: '#2e7d32',
        },
      },
      '&.MuiAlert-standardError': {
        backgroundColor: '#ffebee', 
        color: '#d32f2f', 
        '& .MuiAlert-icon': {
          color: '#d32f2f',
        },
      },
    }}
  >
    {snackbar.message}
  </Alert>
</Snackbar>
    </TemplateLayout>
  );
};