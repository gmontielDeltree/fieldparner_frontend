import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import 'semantic-ui-css/semantic.min.css';
import {
  Handshake as HandshakeIcon,
  Description as DescriptionIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import {  useAppDispatch, useCorporateContract } from "../../hooks";
import { setCorporateContractActive } from "../../redux/corporateContract";
import { useTranslation } from "react-i18next";
import { CorporateContract } from "../../interfaces/corporateContract";
import { GenericListPage } from "../GenericListPage";

export const ListCorporateContractPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  // const { isLoading } = useAppSelector((state) => state.ui);
  const { corporateContract, getCorporateContract, removeCorporateContract} =  useCorporateContract();
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
    {field: "idContract", headerName: t("contract_id"), flex: 1},
    { field: "description", headerName: t("_description"), flex: 1 },
    { field: "totalCompany", headerName: t("_company") , flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
    {
      field: "actions",
      headerName: "",
      flex: 1,
      sortable: false,
      renderCell: (params: { row: CorporateContract; }) => (
        <Box display="flex" justifyContent="center">
          <Tooltip title={t("icon_edit")}>
            <IconButton
              aria-label={t("icon_edit")}
              onClick={() => onClickUpdateCorporateContract(params.row)}
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
              onClick={() => handleDeleteCorporateContract(params.row)}
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
    getCorporateContract();
  }, []);
  



  const onClickUpdateCorporateContract = (item: CorporateContract): void => {
    dispatch(setCorporateContractActive(item));
    navigate(`/init/overview/corporate-contract/${item._id}`);
  };



  const handleDeleteCorporateContract = (item: CorporateContract) => {
    if (item._id && item._rev) {
      removeCorporateContract(item._id, item._rev);
      getCorporateContract();
    }
  };

  return (
    <GenericListPage
      title={t("corporate_contracts")}
      icon={
        <Box display="flex" alignItems="center">
          <DescriptionIcon/>
            <HandshakeIcon sx={{ marginRight: "8px"}}/>
        </Box>
      }
      data={corporateContract}
      columns={columns}
      getData={getCorporateContract}
      deleteData={removeCorporateContract}
      setActiveItem={setCorporateContractActive}
      newItemPath="/init/overview/corporate-contract/new"
      editItemPath={(id) => `/init/overview/corporate-contract/${id}`}
      isLoading={false}
    />
  );

  
  
};
