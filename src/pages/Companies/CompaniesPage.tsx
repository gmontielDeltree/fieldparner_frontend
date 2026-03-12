import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Box, IconButton, Tooltip } from '@mui/material';
import 'semantic-ui-css/semantic.min.css';
import {
  Business as BusinessIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useAppDispatch, useCompany } from '../../hooks';
import { setCompanyActive } from '../../redux/companies';
import { useTranslation } from 'react-i18next';
import { GenericListPage } from '../../components';
import { Company } from '../../interfaces/company';

export const CompaniesPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, companies, removeCompany, getCompanies } = useCompany();

  // const { filterText, handleInputChange } = useForm({ filterText: "" });
  const { t } = useTranslation();

  const columns = [
    { field: 'trybutaryCode', headerName: t('tax_id_identification_number'), flex: 1 },
    { field: 'fantasyName', headerName: t('name_negal_name'), flex: 1 },
    { field: 'address', headerName: t('_address'), flex: 1 },
    { field: 'province', headerName: t('_state'), flex: 1 },
    { field: 'country', headerName: t('id_country'), flex: 1 },
    {
      field: 'actions',
      headerName: '',
      flex: 1,
      sortable: false,
      renderCell: (params: { row: Company }) => (
        <Box display='flex' justifyContent='center'>
          <Tooltip title={t('icon_edit')}>
            <IconButton
              aria-label={t('icon_edit')}
              onClick={() => onClickUpdateCorporateCompanies(params.row)}
              sx={{
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.2)' },
              }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('icon_delete')}>
            <IconButton
              aria-label={t('icon_delete')}
              onClick={() => handleDeleteCorporateCompanies(params.row)}
              sx={{
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.2)' },
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
    getCompanies();
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

  const onClickUpdateCorporateCompanies = (item: Company): void => {
    dispatch(setCompanyActive(item));
    navigate(`/init/overview/corporate-companies/${item._id}`); //TODO: chequear si deberia ser el id o el companyId
  };

  const handleDeleteCorporateCompanies = async (item: Company) => {
    if (item._id && item._rev) {
      await removeCompany(item._id, item._rev);
      getCompanies();
    }
  };

  return (
    <GenericListPage
      moduleRoute='/init/overview/corporate-companies'
      isLoading={isLoading}
      data={companies}
      columns={columns}
      getData={getCompanies}
      deleteData={removeCompany}
      setActiveItem={setCompanyActive}
      newItemPath='/init/overview/corporate-companies/new'
      editItemPath={id => `/init/overview/corporate-companie/${id}`}
    />
  );
};
