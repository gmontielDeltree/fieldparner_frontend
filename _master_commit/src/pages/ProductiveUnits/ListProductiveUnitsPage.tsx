import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Box, IconButton, Tooltip } from '@mui/material';
import 'semantic-ui-css/semantic.min.css';
import {


  Edit as EditIcon,

} from '@mui/icons-material';
import { useAppDispatch, useProductiveUnits } from '../../hooks';
import { setProductiveUnitsActive } from '../../redux/productiveUntis';
import { useTranslation } from 'react-i18next';
import { ProductUnits } from '../../interfaces/productiveUnits';
import { GenericListPage } from '../../components';

export const ListProductiveUnits: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  // const { isLoading } = useAppSelector((state) => state.ui);
  const { listProductiveUnits, getProductiveUnits, removeProductiveUnits } = useProductiveUnits();
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
    { field: 'units', headerName: t('_units'), flex: 1 },
    { field: 'description', headerName: t('_description'), flex: 1 },
    {
      field: 'actions',
      headerName: '',
      flex: 1,
      sortable: false,
      renderCell: (params: { row: ProductUnits }) => (
        <Box display='flex' justifyContent='center'>
          <Tooltip title={t('icon_edit')}>
            <IconButton
              aria-label={t('icon_edit')}
              onClick={() => onClickUpdateCorporateContract(params.row)}
              sx={{
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.2)' },
              }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          {/* <Tooltip title={t("icon_delete")}>
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
          </Tooltip> */}
        </Box>
      ),
    },
  ];
  console.log('listProductiveUnits', listProductiveUnits);
  useEffect(() => {
    getProductiveUnits();
  }, []);

  const onClickUpdateCorporateContract = (item: ProductUnits): void => {
    dispatch(setProductiveUnitsActive(item));
    console.log('item', item);
    navigate(`/init/overview/productive-units/${item.idProductiveUnit}`);
  };
  //TODO: implement delete
  // const handleDeleteCorporateContract = (item: ProductUnits) => {
  //   // if (item._id && item._rev) {
  //   //   removeProductiveUnits(item._id, item._rev);
  //   //   getProductiveUnits();
  //   // }
  //   console.log('item', item);
  // };

  return (
    <GenericListPage
      moduleRoute='/init/overview/productive-units'
      data={listProductiveUnits}
      columns={columns}
      getData={getProductiveUnits}
      deleteData={removeProductiveUnits}
      setActiveItem={setProductiveUnitsActive}
      newItemPath='/init/overview/productive-units/new'
      editItemPath={id => `/init/overview/productive-units/${id}`}
      isLoading={false}
    />
  );
};
