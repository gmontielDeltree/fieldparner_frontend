import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import 'semantic-ui-css/semantic.min.css';
import {
  Business as BusinessIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useForm, useAppDispatch, useCorporateCompanies } from "../hooks";
import { setCorporateCompaniesActive } from "../redux/corporateCompanies";
import { useTranslation } from "react-i18next";
import { CorporateCompanies } from "../types";
import { GenericListPage } from "./GenericListPage";

export const ListCorporateCompaniesPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  // const { isLoading } = useAppSelector((state) => state.ui);
  const { isLoading, corporateCompanies, getCorporateCompanies, setCorporateCompanies, removeCorporateCompanies} =  useCorporateCompanies();
 // const { filterText, handleInputChange } = useForm({ filterText: "" });
  const { t } = useTranslation();

  // const columns: ColumnProps[] = [
  //   { text: t("tax_id_identification_number"), align: "center" },
  //   { text: t("name_negal_name"), align: "center" },
  //   { text: t("_address"), align: "center" },
  //   { text: t("_state"), align: "center" },
  //   { text: t("id_country"), align: "center" },
  //   { text: "", align: "center" },
  // ];

  const columns = [
    {field: "taxKey", headerName: t("tax_id_identification_number"), flex: 1},
    { field: "fantasyName", headerName: t("name_negal_name"), flex: 1 },
    { field: "domicile", headerName: t("_address"), flex: 1 },
    { field: "state", headerName: t("_state") , flex: 1 },
    { field: "countryId", headerName: t("id_country") , flex: 1 },
    {
      field: "actions",
      headerName: "",
      flex: 1,
      sortable: false,
      renderCell: (params: { row: CorporateCompanies; }) => (
        <Box display="flex" justifyContent="center">
          <Tooltip title={t("icon_edit")}>
            <IconButton
              aria-label={t("icon_edit")}
              onClick={() => onClickUpdateCorporateCompanies(params.row)}
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
              onClick={() => handleDeleteCorporateCompanies(params.row)}
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

  useEffect(() => {
    getCorporateCompanies();
  }, []);
  

  // const onClickSearch = (): void => {
  //   if (filterText === "") {
  //     getCorporateCompanies();
  //     return;
  //   }
  //   const filteredCorporate = corporateCompanies.filter(
  //     ({ businessName, fantasyName }) =>
  //       (businessName &&
  //         businessName.toLowerCase().includes(filterText.toLowerCase())) ||
  //       (fantasyName &&
  //         fantasyName.toLowerCase().includes(filterText.toLowerCase()))
  //   );
  //   setCorporateCompanies(filteredCorporate);
  // };

  //const onClickAddBusiness = () => navigate("/init/overview/corporate-companies/new");

  const onClickUpdateCorporateCompanies = (item: CorporateCompanies): void => {
    dispatch(setCorporateCompaniesActive(item));
    navigate(`/init/overview/corporate-companies/${item._id}`);
  };



  const handleDeleteCorporateCompanies = (item: CorporateCompanies) => {
    if (item._id && item._rev) {
      removeCorporateCompanies(item._id, item._rev);
      getCorporateCompanies();
    }
  };

  return (
    <GenericListPage
      title={t("corporate_companies")}
      icon={
        <Box display="flex" alignItems="center">
          <BusinessIcon sx={{ marginRight: '8px' }} />
        </Box>
      }
      data={corporateCompanies}
      columns={columns}
      getData={getCorporateCompanies}
      deleteData={removeCorporateCompanies}
      setActiveItem={setCorporateCompaniesActive}
      newItemPath="/init/overview/corporate-companies/new"
      editItemPath={(id) => `/init/overview/corporate-companie/${id}`}
    />
  );
};
