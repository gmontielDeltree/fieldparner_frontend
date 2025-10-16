import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";

import {
  Edit as EditIcon,
  Delete as DeleteIcon
} from "@mui/icons-material";
import {  useAppDispatch, useDeposit } from "../../hooks";
import { setDepositActive } from "../../redux/deposit";
import { useTranslation } from "react-i18next";
import { Deposit } from "../../types";
import { GenericListPage } from "../../components";

export const ListDepositsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { deposits, getDeposits, deleteDeposit,} = useDeposit();


  useEffect(() => {
    getDeposits();
  }, []);

  const columns = [
    { field: "description", headerName: t("_description"), flex: 1 },
    { field: "owner", headerName: t("_owner"), flex: 1 },
    { field: "isVirtual", headerName: t("physical_virtual"), flex: 1, renderCell: (params: { value: any; }) => (
        <Chip
          variant={params.value ? "filled" : "outlined"}
          label={params.value ? t("_virtual") : t("physical_masculine")}
        />
      ) 
    },
    { field: "address", headerName: t("_address"), flex: 1 },
    { field: "locality", headerName: t("_locality"), flex: 1 },
    { field: "country", headerName: t("id_country"), flex: 1 },
    {
      field: "actions",
      headerName: "",
      flex: 1,
      sortable: false,
      renderCell: (params: { row: Deposit; }) => (
        <Box display="flex" justifyContent="center">
          <Tooltip title={t("icon_edit")}>
            <IconButton
              aria-label={t("icon_edit")}
              onClick={() => onClickUpdateDeposit(params.row)}
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
              onClick={() => handleDeleteDeposit(params.row)}
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

  // const onClickSearch = (): void => {
  //   if (filterText === "") {
  //     getDeposits();
  //     return;
  //   }
  //   const filteredDeposits = deposits.filter(({ description: descripcion, owner: propietario }) =>
  //     (descripcion && descripcion.toLowerCase().includes(filterText.toLowerCase())) ||
  //     (propietario && propietario.toLowerCase().includes(filterText.toLowerCase()))
  //   );
  //   setDeposits(filteredDeposits);
  // };

  //const onClickAddDeposit = () => navigate("/init/overview/deposit/new");

  const onClickUpdateDeposit = (item: Deposit) => {
    dispatch(setDepositActive(item));
    navigate(`/init/overview/deposit/${item._id}`);
  };

  const handleDeleteDeposit = (item: Deposit) => {
    if (item._id && item._rev) {
      deleteDeposit(item._id, item._rev);
      getDeposits();
    }
  };

  return (
    <GenericListPage
      moduleRoute='/init/overview/deposit'
      data={deposits}
      columns={columns}
      getData={getDeposits}
      deleteData={deleteDeposit}
      setActiveItem={setDepositActive}
      newItemPath="/init/overview/deposit/new"
      editItemPath={(id) => `/init/overview/deposit/${id}`}
    />
  );
};
