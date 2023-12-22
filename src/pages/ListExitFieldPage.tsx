
import React, { useEffect } from 'react';
import { Loading, TemplateLayout } from '../components';
import { Box, Button, Grid, Typography } from '@mui/material';
import {
  Add as AddIcon,
  Agriculture as AgricultureIcon,
  ArrowRightAlt as ArrowRightAltIcon
} from "@mui/icons-material";
import { useExitField } from '../hooks';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import { useNavigate } from 'react-router';


const columns: GridColDef[] = [
  // { field: "id", hide: true },
  { field: "creationDate", headerName: "Fecha", width: 200 },
  { field: "field", headerName: "Campo", width: 150 },
  { field: "lot", headerName: "Lote", width: 200 },
  { field: "campaign", headerName: "Campaña", width: 200 },
  { field: "supplyId", headerName: "Insumo", width: 150 },
  { field: "transport", headerName: "Transporte", width: 150 },
  { field: "kgNet", headerName: "Kg Netos", width: 100 },
];


export const ListExitFieldPage: React.FC = () => {

  const navigate = useNavigate();
  const { isLoading, exitFields, getExitFields } = useExitField();

  const onClickAdd = () => navigate("/overview/exit-field/new");

  useEffect(() => {
    getExitFields();
  }, [])

  return (
    <TemplateLayout key="fields-out" viewMap={true}>
      {isLoading && <Loading loading={true} />}
      <Box
        component="div"
        display="flex"
        alignItems="center"
        sx={{ ml: { sm: 2 }, pt: 2 }}
      >
        <AgricultureIcon fontSize='large' /> <ArrowRightAltIcon fontSize='large' />
        <Typography component="h2" variant="h4" sx={{ ml: { sm: 2 } }}>
          Salida de Campo
        </Typography>
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
              onClick={onClickAdd}
            >
              Nuevo
            </Button>
          </Grid>
        </Grid>
        <Box component="div" sx={{ p: 1 }}>
          <DataGrid
            autoHeight
            rowSelection={false}
            loading={isLoading}
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
              },
            }}
            rows={exitFields}
            columns={columns}
          />
        </Box>
      </Box>
    </TemplateLayout>
  )
}
