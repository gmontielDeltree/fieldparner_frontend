import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import 'semantic-ui-css/semantic.min.css';
import {
  MonetizationOn as MonetizationOnIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import {  useAppDispatch, useCostsExpensess } from "../../hooks";
import { setCostsExpensesActive } from "../../redux/costsExpenses";
import { useTranslation } from "react-i18next";
import {CostsExpenses } from "../../interfaces/costsExpenses";
import { GenericListPage } from "../GenericListPage";

export const ListCostsExpenses: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  // const { isLoading } = useAppSelector((state) => state.ui);
  const { costsExpenses, getCostsExpenses, removeCostsExpenses} =  useCostsExpensess();
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
    {field: "costCode", headerName: t("cost_code"), flex: 1},
    { field: "description", headerName: t("_description"), flex: 1 },
    { field: "costCenter", headerName: t("cost_center"), flex: 1 },
    {
      field: "actions",
      headerName: "",
      flex: 1,
      sortable: false,
      renderCell: (params: { row: CostsExpenses; }) => (
        <Box display="flex" justifyContent="center">
          <Tooltip title={t("icon_edit")}>
            <IconButton
              aria-label={t("icon_edit")}
              onClick={() => onClickUpdateCostsExpenses(params.row)}
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
              onClick={() => handleDeleteCostsExpenses(params.row)}
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
    getCostsExpenses();
  }, []);
  
  



  const onClickUpdateCostsExpenses = (item: CostsExpenses): void => {
    dispatch(setCostsExpensesActive(item));
    navigate(`/init/overview/costs-expenses/${item._id}`);
  };



  const handleDeleteCostsExpenses = (item:  CostsExpenses) => {
    if (item._id && item._rev) {
      removeCostsExpenses(item._id, item._rev);
      getCostsExpenses();
    }
  };

  return (
    <GenericListPage
      title={t("costs_expenses")}
      icon={
        <Box display="flex" alignItems="center">
      <MonetizationOnIcon/>
        </Box>
      }
      data={costsExpenses}
      columns={columns}
      getData={getCostsExpenses}
      deleteData={removeCostsExpenses}
      setActiveItem={setCostsExpensesActive}
      newItemPath="/init/overview/costs-expenses/new"
      editItemPath={(id) => `/init/overview/costs-expenses/${id}`}
      isLoading={false}
    />
  );

  
  
};
