
import React, { useEffect } from 'react';
import { DataTable, ItemRow, Loading, TableCellStyled, TemplateLayout, CloseButtonPage } from '../components';
import { Box, Button, Grid, IconButton, Tooltip, Typography } from '@mui/material';
import {
  Add as AddIcon,
  Agriculture as AgricultureIcon,
  ArrowRightAlt as ArrowRightAltIcon,
  Edit as EditIcon
} from "@mui/icons-material";
import { useExitField } from '../hooks';
import { useNavigate } from 'react-router';
import { ColumnProps } from '../types';



const columns: ColumnProps[] = [
  { text: "Fecha", align: "center" },
  { text: "Campo", align: "center" },
  { text: "Lote", align: "center" },
  { text: "Campaña", align: "left" },
  { text: "Insumo", align: "center" },
  { text: "Transporte", align: "center" },
  { text: "Kg Netos", align: "center" },
  { text: "", align: "center" }
];

export const ListExitFieldPage: React.FC = () => {

  const navigate = useNavigate();
  const { isLoading, exitFields, getExitFields } = useExitField();

  const onClickAdd = () => navigate("/init/overview/exit-field/new");

  useEffect(() => {
    getExitFields();
  }, [])

  return (
    <TemplateLayout key="list-exit-field" viewMap={true}>
      {isLoading && <Loading loading={true} />}
      <Box
        component="div"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ ml: { sm: 2 }, pt: 2, pr: 2 }}
      >
        <Box display="flex" alignItems="center">
          <AgricultureIcon fontSize='large' /> <ArrowRightAltIcon fontSize='large' />
          <Typography component="h2" variant="h4" sx={{ ml: { sm: 2 } }}>
            Salida de Campo
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
              onClick={onClickAdd}
            >
              Nuevo
            </Button>
          </Grid>
        </Grid>
        <Box component="div" sx={{ p: 1 }}>
          <DataTable
            key="datatable-exit-fields"
            columns={columns}
            isLoading={isLoading}
          >
            {exitFields.map((row) => (
              <ItemRow key={row._id}>
                <TableCellStyled align="center">
                  {row.creationDate}
                </TableCellStyled>
                <TableCellStyled align="center">{row.field?.nombre} </TableCellStyled>
                <TableCellStyled align="center">{row.field?.lotes.find(l => l._id === row.lotId)?.properties.nombre}</TableCellStyled>
                <TableCellStyled>{row.campaignId}</TableCellStyled>
                <TableCellStyled align="center">{row.supply?.name}</TableCellStyled>
                <TableCellStyled>{row.transport?.nombreCompleto}</TableCellStyled>
                <TableCellStyled>{row.kgNet}</TableCellStyled>
                <TableCellStyled align="center">
                  <Tooltip title="Editar">
                    <IconButton
                      aria-label="Editar"
                      onClick={() => console.log(row)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                </TableCellStyled>
              </ItemRow>
            ))}
          </DataTable>
        </Box>
      </Box>
    </TemplateLayout>
  )
}

/*

*/