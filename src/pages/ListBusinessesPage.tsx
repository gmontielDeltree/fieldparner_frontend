import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  TemplateLayout,
  Loading,
  SearchButton,
  SearchInput,
  DataTable,
  ItemRow,
  TableCellStyled,
  CloseButtonPage,
  // PaisTableCell,
} from "../components";
import { ColumnProps } from "../types";
import {
  Box,
  Button,
  Container,
  Grid,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import 'semantic-ui-css/semantic.min.css';
import {  Icon  } from "semantic-ui-react";
import {
  Add as AddIcon,
  Business as BusinessIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { useForm, useAppDispatch, useBusiness } from "../hooks";
import { setBusinessActive } from "../redux/business";
import { useTranslation } from "react-i18next";
import { Business, BusinessItem } from "../interfaces/socialEntity";

export const ListBusinessesPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  // const { isLoading } = useAppSelector((state) => state.ui);
  const { isLoading, businesses, getBusinesses, setBusinesses, deleteBusiness} = useBusiness();
  const { filterText, handleInputChange } = useForm({ filterText: "" });
  const { t } = useTranslation();

  const columns: ColumnProps[] = [
    { text: t("entity_type"), align: "center" },
    { text: t("name_negal_name"), align: "center" },
    { text: t("tax_id_identification_number"), align: "center" },
    { text: t("Email"), align: "left" },
    { text: t("id_country"), align: "center" },
    { text: "", align: "center" },
  ];

  

  const onClickSearch = (): void => {
    if (filterText === "") {
      getBusinesses();
      return;
    }
    const filteredBusinesses = businesses.filter(
      ({ razonSocial, nombreCompleto }) =>
        (razonSocial &&
          razonSocial.toLowerCase().includes(filterText.toLowerCase())) ||
        (nombreCompleto &&
          nombreCompleto.toLowerCase().includes(filterText.toLowerCase()))
    );
    setBusinesses(filteredBusinesses);
  };

  const onClickAddBusiness = () => navigate("/init/overview/business/new");

  const onClickUpdateBusiness = (item: BusinessItem) => {
    const { country, ...rest } = item;
    dispatch(setBusinessActive(rest));
    navigate(`/init/overview/business/${item._id}`);
  };



  const handleDeleteBusiness = (item: Business) => {
    if (item._id && item._rev) {
      deleteBusiness(item._id, item._rev);
      getBusinesses();
    }
  };

  useEffect(() => {
    getBusinesses();
  }, []);

  return (
    <TemplateLayout key="overview-business" viewMap={false}>
      {isLoading && <Loading loading={true} />}
      <Container maxWidth="lg">
        <Box
          component="div"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{ ml: { sm: 2 }, pt: 2, pr: 2 }}
        >
          <Box display="flex" alignItems="center">
            <BusinessIcon sx={{ marginRight: '8px' }} />
            <Typography component="h4" variant="h5" sx={{ ml: { sm: 2 } }}>
              {t("social_entities")}
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
                onClick={onClickAddBusiness}
              >
                {t("add_new")}
              </Button>
            </Grid>
            <Grid item xs={12} sm={10}>
              <Grid container justifyContent="flex-end">
                <Grid item xs={8} sm={7}>
                  <SearchInput
                    value={filterText}
                    placeholder={t("company_name_/name")}
                    handleInputChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={4} sm={3}>
                  <SearchButton text={t("icon_search")} onClick={() => onClickSearch()} />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Box component="div" sx={{ p: 1 }}>
            <DataTable
              key="datatable-business"
              columns={columns}
              isLoading={isLoading}
            >
              {businesses.map((row) => (
                <ItemRow key={row._id} hover>
                  <TableCellStyled align="center">
                    {row.tipoEntidad}
                  </TableCellStyled>
                  <TableCellStyled align="center">
                    {row.razonSocial || row.nombreCompleto}
                  </TableCellStyled>
                  <TableCellStyled align="center">
                    {row.cuit || row.documento}
                  </TableCellStyled>
                  <TableCellStyled>{row.email}</TableCellStyled>
                  <TableCellStyled align="center">
                   {/* <PaisTableCell pais={row.pais} mostrarDato="descriptionES" /> */}
                  </TableCellStyled>
                  <TableCellStyled align="center">
                    <Tooltip title={t("icon_edit")}>
                      <IconButton
                        aria-label={t("icon_edit")}
                        onClick={() => onClickUpdateBusiness(row)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t("icon_delete")}>
                      <IconButton
                        onClick={() => handleDeleteBusiness(row)}
                        style={{ fontSize: '1rem' }}
                      >
                        <Icon name="trash alternate" />
                      </IconButton>
                    </Tooltip>
                  </TableCellStyled>
                </ItemRow>
              ))}
            </DataTable>
          </Box>
        </Box>
      </Container>
    </TemplateLayout>
  );
};
