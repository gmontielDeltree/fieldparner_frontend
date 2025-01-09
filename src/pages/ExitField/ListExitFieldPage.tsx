
import React, { useEffect } from 'react';
import { DataTable, ItemRow, Loading, TableCellStyled, TemplateLayout, CloseButtonPage } from '../../components';
import { Box, Button, Grid, IconButton, Tooltip, Typography } from '@mui/material';
import {
  Add as AddIcon,
  Agriculture as AgricultureIcon,
  ArrowRightAlt as ArrowRightAltIcon,
  Edit as EditIcon
} from "@mui/icons-material";
import { useExitField } from '../../hooks';
import { useNavigate } from 'react-router';
import { ColumnProps } from '@types';
import { useTranslation } from 'react-i18next';




export const ListExitFieldPage: React.FC = () => {

  const navigate = useNavigate();
  const { isLoading, exitFields, getExitFields } = useExitField();
const {t} = useTranslation();

  const onClickAdd = () => navigate("/init/overview/exit-field/new");

  const columns: ColumnProps[] = [
    { text: t("_date"), align: "center" },
    { text: t("_field"), align: "center" },
    { text: t("_batch"), align: "center" },
    { text: t("_campaign"), align: "left" },
    { text: t("_supply"), align: "center" },
    { text: t("_transport"), align: "center" },
    { text: t("net_kg"), align: "center" },
    { text: "", align: "center" }
  ];

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
            {t("field_output")}
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
              {t("new_masculine")}
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
                <TableCellStyled align="center">{row.crop?.name}</TableCellStyled>
                <TableCellStyled>{row.transport?.nombreCompleto}</TableCellStyled>
                <TableCellStyled>{row.kgNet}</TableCellStyled>
                <TableCellStyled align="center">
                  <Tooltip title={t("icon_edit")}>
                    <IconButton
                      aria-label={t("icon_edit")}
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