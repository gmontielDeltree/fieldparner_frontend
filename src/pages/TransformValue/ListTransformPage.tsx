import React, { useMemo, useState } from 'react';
import {
  Box,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  Transform as TransformIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from '@mui/icons-material';
import { useTransformStock } from '../../hooks';
import { useTranslation } from 'react-i18next';
import { GenericListPage } from '../../components';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { StockMovementItem } from '../../types';

interface ExpandableRowProps {
  row: {
    income: StockMovementItem[];
    output: StockMovementItem[];
  };
}

const ExpandableRow: React.FC<ExpandableRowProps> = ({ row }) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  const totalIncome = row.income?.reduce((total, item) => total + item.amount, 0);
  const totalOutput = row.output?.reduce((total, item) => total + item.amount, 0);

  return (
    <Box>
      <TableRow>
        <TableCell>
          <IconButton size='small' onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{row.income[0]?.operationDate}</TableCell>
        <TableCell>{row.income[0]?.detail}</TableCell>
        <TableCell align='right'>{totalIncome}</TableCell>
        <TableCell align='right'>{totalOutput}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout='auto' unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant='h6' gutterBottom component='div'>
                {t('source_supplies')}
              </Typography>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell align='center'>{t('_supply')}</TableCell>
                    <TableCell align='center'>{t('_warehouse')}</TableCell>
                    <TableCell align='right'>UM</TableCell>
                    <TableCell align='right'>{t('_quantity')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.income?.map((rowIn, i) => (
                    <TableRow key={i}>
                      <TableCell align='center'>{rowIn.supply?.name}</TableCell>
                      <TableCell align='center'>{rowIn.deposit?.description}</TableCell>
                      <TableCell align='right'>{rowIn.supply?.unitMeasurement}</TableCell>
                      <TableCell align='right'>{rowIn.amount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Typography variant='h6' gutterBottom component='div' sx={{ mt: 1 }}>
                {t('new_supply_destination')}
              </Typography>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell align='center'>{t('_supply')}</TableCell>
                    <TableCell align='center'>{t('_warehouse')}</TableCell>
                    <TableCell align='right'>UM</TableCell>
                    <TableCell align='right'>{t('_quantity')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.output?.map((rowOut, i) => (
                    <TableRow key={i}>
                      <TableCell align='center'>{rowOut.supply?.name}</TableCell>
                      <TableCell align='center'>{rowOut.deposit?.description}</TableCell>
                      <TableCell align='right'>{rowOut.supply?.unitMeasurement}</TableCell>
                      <TableCell align='right'>{rowOut.amount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </Box>
  );
};

export const ListTransformPage: React.FC = () => {
  const { transformMovements, getTransformationMovements } = useTransformStock();
  const { t } = useTranslation();

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'expandable',
        headerName: '',
        width: 50,
        renderCell: (params: GridRenderCellParams) => <ExpandableRow row={params.row} />,
        sortable: false,
        filterable: false,
      },
      { field: 'date', headerName: t('Date'), width: 150 },
      { field: 'detail', headerName: t('_detail'), width: 200 },
      { field: 'totalIncome', headerName: t('Total Ingreso'), width: 150, type: 'number' },
      { field: 'totalOutput', headerName: t('Total Salida'), width: 150, type: 'number' },
    ],
    [t],
  );

  const rows = useMemo(() => {
    return Object.values(transformMovements).map((row, index) => ({
      id: index,
      date: row.income[0]?.operationDate,
      detail: row.income[0]?.detail,
      totalIncome: row.income?.reduce((total, item) => total + item.amount, 0),
      totalOutput: row.output?.reduce((total, item) => total + item.amount, 0),
      ...row,
    }));
  }, [transformMovements]);

  // useEffect(() => {
  //   getTransformationMovements();
  // }, []);

  return (
    <GenericListPage
      title={t('transformation_added_value')}
      icon={<TransformIcon />}
      data={rows}
      columns={columns}
      getData={getTransformationMovements}
      deleteData={() => {}}
      setActiveItem={() => {}}
      newItemPath='/init/overview/value-transform/new'
      editItemPath={() => ''}
      isLoading={false}
    />
  );
};
