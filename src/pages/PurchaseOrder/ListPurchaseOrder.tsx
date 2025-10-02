import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';
import { Box, IconButton, Tooltip } from '@mui/material';
import { Icon } from 'semantic-ui-react';
import { Edit as EditIcon, Print as PrintIcon } from '@mui/icons-material';
import { userPurchaseOrder } from '../../hooks';
import { useTranslation } from 'react-i18next';
import { Helper } from '../../helpers/helper';
import { GenericListPage } from '../../components';
import { GridColDef } from '@mui/x-data-grid';
import { PurchaseOrder, DetailPurchaseOrderItem } from '../../types';
import { urlImg } from '../../config';

// Estilos para el PDF
const styles = StyleSheet.create({
  page: { padding: 30 },
  section: { marginBottom: 10 },
  header: { fontSize: 14, marginBottom: 20 },
  body: { fontSize: 12, marginBottom: 10 },
  table: { display: 'flex', flexDirection: 'column', marginBottom: 20 },
  tableRow: { flexDirection: 'row' },
  tableColHeader: {
    flex: 1,
    borderStyle: 'solid',
    borderWidth: 1,
    backgroundColor: '#D3D3D3',
    padding: 5,
  },
  tableCol: { flex: 1, borderStyle: 'solid', borderWidth: 1, padding: 5 },
  tableCellHeader: { margin: 5, fontSize: 10, fontWeight: 'bold' },
  tableCell: { margin: 5, fontSize: 10 },
  subtotal: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  total: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, fontWeight: 'bold' },
  logo: { width: 50, height: 50, marginBottom: 10 },
  companyDetails: { marginBottom: 20 },
});

interface PurchaseOrderPDFProps {
  purchaseOrder: PurchaseOrder;
  details: DetailPurchaseOrderItem[];
}

const PurchaseOrderPDF = ({ purchaseOrder, details }: PurchaseOrderPDFProps) => (
  <Document>
    <Page size='A4' style={styles.page}>
      <View style={styles.companyDetails}>
        <Image style={styles.logo} src={`${urlImg}${purchaseOrder.businessLogo}`} />
        <Text>Farm company</Text>
        <Text>Ruta 3 Km 251, Las Flores, Pcia Bs. As CP 7100</Text>
        <Text>CUIT: XX-XXXXXXXX-X</Text>
        <Text>Orden de Compra Nro {purchaseOrder.nroOrder}</Text>
        <Text>{purchaseOrder.creationDate}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.header}>Proveedor:</Text>
        <Text style={styles.body}>{purchaseOrder.businessName}</Text>
        <Text
          style={styles.body}
        >{`${purchaseOrder.address} - ${purchaseOrder.locality} - CP ${purchaseOrder.zipCode} - ${purchaseOrder.country}`}</Text>
        <Text style={styles.body}>Att: xxxxxxxxxxxx</Text>
      </View>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          {['Artículo', 'UM', 'Cantidad', 'Precio Unitario', 'Precio Total'].map(header => (
            <View style={styles.tableColHeader} key={header}>
              <Text style={styles.tableCellHeader}>{header}</Text>
            </View>
          ))}
        </View>
        {details.map((d, index) => (
          <View style={styles.tableRow} key={index}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{d.supply?.name}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{d.supply?.unitMeasurement}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{d.supplyAmount}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>
                {Helper.parseDecimalPointToComaWithCurrency(d.unitPrice, '$', 2)}
              </Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>
                {Helper.parseDecimalPointToComaWithCurrency(
                  Number(d.unitPrice) * Number(d.supplyAmount),
                  '$',
                  2,
                )}
              </Text>
            </View>
          </View>
        ))}
      </View>
      <View style={styles.subtotal}>
        <Text>
          Subtotal: {Helper.parseDecimalPointToComaWithCurrency(purchaseOrder.subtotal, '$', 2)}
        </Text>
      </View>
      <View style={styles.subtotal}>
        <Text>
          Impuesto {`% ${purchaseOrder.taxPercentage}`}:{' '}
          {Helper.parseDecimalPointToComaWithCurrency(purchaseOrder.taxValue, '$', 2)}
        </Text>
      </View>
      <View style={styles.subtotal}>
        <Text>
          Otros {`% ${purchaseOrder.anotherPercentage}`}:{' '}
          {Helper.parseDecimalPointToComaWithCurrency(purchaseOrder.anotherValue, '$', 2)}
        </Text>
      </View>
      <View style={styles.total}>
        <Text>
          Total: {Helper.parseDecimalPointToComaWithCurrency(purchaseOrder.totalValue, '$', 2)}
        </Text>
      </View>
    </Page>
  </Document>
);

export const ListPurchaseOrder: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isLoading, purchaseOrders, getPurchaseOrders } = userPurchaseOrder();

  const columns: GridColDef[] = useMemo(
    () => [
      { field: 'creationDate', headerName: t('_date'), width: 150, align: 'center' },
      { field: 'nroOrder', headerName: t('purchase_order'), width: 150, align: 'center' },
      { field: 'businessName', headerName: t('provider'), width: 200, align: 'center' },
      {
        field: 'totalValue',
        headerName: t('total_amount'),
        width: 150,
        align: 'right',
        valueFormatter: params => Helper.parseDecimalPointToComaWithCurrency(params.value, '$', 2),
      },
      {
        field: 'actions',
        headerName: t('actions'),
        width: 150,
        align: 'center',
        renderCell: params => (
          <Box>
            <Tooltip title={t('icon_edit')}>
              <IconButton onClick={() => onClickUpdatePurchaseOrder(params.row)}>
                <EditIcon />
              </IconButton>
            </Tooltip>
            <PDFDownloadLink
              document={
                <PurchaseOrderPDF purchaseOrder={params.row} details={params.row.details} />
              }
              fileName={`purchase-order-${params.row.nroOrder}.pdf`}
            >
              {({ loading }) => (loading ? '' : <PrintIcon />)}
            </PDFDownloadLink>
          </Box>
        ),
      },
    ],
    [t],
  );

  const onClickNewPurchaseOrder = () => navigate('/init/overview/purchase-order/new');

  const onClickUpdatePurchaseOrder = (item: PurchaseOrder): void => {
    navigate(`/init/overview/purchase-order/${item.nroOrder}`);
  };

  // useEffect(() => {
  //   getPurchaseOrders();
  // }, []);

  const rows = useMemo(
    () =>
      purchaseOrders.map(({ order, details }) => ({
        ...order,
        details,
        id: order._id,
      })),
    [purchaseOrders],
  );

  return (
    <GenericListPage
      title={t('purchase_order')}
      icon={<Icon name='list alternate outline' size='large' />}
      data={rows}
      columns={columns}
      getData={getPurchaseOrders}
      deleteData={() => {}}
      setActiveItem={() => {}}
      newItemPath='/init/overview/purchase-order/new'
      editItemPath={id => `/init/overview/purchase-order/${id}`}
      isLoading={false}
    />
  );
};
