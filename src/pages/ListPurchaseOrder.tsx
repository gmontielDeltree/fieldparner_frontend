import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Image,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from '@react-pdf/renderer';
import {
  Loading,
  TemplateLayout,
  DataTable,
  ItemRow,
  TableCellStyled,
  CloseButtonPage,
} from "../components";
import { ColumnProps,  DetailPurchaseOrderItem, PurchaseOrder } from "../types";
import {
  Box,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Icon } from "semantic-ui-react";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Print as PrintIcon
} from "@mui/icons-material";
import { useForm,  userPurchaseOrder } from "../hooks";
import { useTranslation } from "react-i18next";
import { Helper } from '../helpers/helper';
import { urlImg } from "../config";


// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  section: {
    marginBottom: 10,
  },
  header: {
    fontSize: 14,
    marginBottom: 20,
  },
  body: {
    fontSize: 12,
    marginBottom: 10,
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableColHeader: {
    flex: 1,
    borderStyle: 'solid',
    borderWidth: 1,
    backgroundColor: '#D3D3D3',
    padding: 5,
  },
  tableCol: {
    flex: 1,
    borderStyle: 'solid',
    borderWidth: 1,
    padding: 5,
  },
  tableCellHeader: {
    margin: 5,
    fontSize: 10,
    fontWeight: 'bold',
  },
  tableCell: {
    margin: 5,
    fontSize: 10,
  },
  subtotal: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  total: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    fontWeight: 'bold',
  },
  logo: {
    width: 50,
    height: 50,
    marginBottom: 10,
  },
  companyDetails: {
    marginBottom: 20,
  },
});

interface PurchaseOrderPDFProps {
  purchaseOrder: PurchaseOrder;
  details: DetailPurchaseOrderItem[];
}

const PurchaseOrderPDF = ({ purchaseOrder, details }: PurchaseOrderPDFProps) => {

  return (
    <Document>
      <Page size="A4" style={styles.page}>
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
          <Text style={styles.body}>{`${purchaseOrder.address} - ${purchaseOrder.locality} - CP ${purchaseOrder.zipCode} - ${purchaseOrder.country}`}</Text>
          <Text style={styles.body}>Att: xxxxxxxxxxxx</Text>
        </View>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Artículo</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>UM</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Cantidad</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Precio Unitario</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Precio Total</Text>
            </View>
          </View>
          {details.map((d, index) => (
            <View style={styles.tableRow} key={index}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{d.supply?.name} </Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{d.supply?.unitMeasurement} </Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{d.supplyAmount} </Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{Helper.parseDecimalPointToComaWithCurrency(d.unitPrice, "$", 2)} </Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{Helper.parseDecimalPointToComaWithCurrency((Number(d.unitPrice) * Number(d.supplyAmount)), "$", 2)}</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.subtotal}>
          <Text>Subtotal: {Helper.parseDecimalPointToComaWithCurrency(purchaseOrder.subtotal, "$", 2)} </Text>
        </View>
        <View style={styles.subtotal}>
          <Text>Impuesto {`% ${purchaseOrder.taxPercentage}`}: {Helper.parseDecimalPointToComaWithCurrency(purchaseOrder.taxValue, "$", 2)}</Text>
        </View>
        <View style={styles.subtotal}>
          <Text>Otros {`% ${purchaseOrder.anotherPercentage}`}: {Helper.parseDecimalPointToComaWithCurrency(purchaseOrder.anotherValue, "$", 2)}</Text>
        </View>
        <View style={styles.total}>
          <Text>Total: {Helper.parseDecimalPointToComaWithCurrency(purchaseOrder.totalValue, "$", 2)}</Text>
        </View>
      </Page>
    </Document>
  )
}


export const ListPurchaseOrder: React.FC = () => {
  const navigate = useNavigate();
  // const dispatch = useAppDispatch();
  const { t } = useTranslation();
  // const [instance, updateInstance] = usePDF({ document: <></> });

  const {
    isLoading,
    purchaseOrders,
    getPurchaseOrders } = userPurchaseOrder();
  const { filterText, handleInputChange } = useForm({ filterText: "" });

  const columns: ColumnProps[] = React.useMemo(() => {
    return [
      { text: t("_date"), align: "center" },
      { text: t("purchase_order"), align: "center" },
      { text: t("provider"), align: "center" },
      { text: t("total_amount"), align: "right" },
      { text: "", align: "center" },
    ]
  }, [t]);

  const onClickNewPurchaseOrder = () => navigate("/init/overview/purchase-order/new");

  const onClickUpdatePurchaseOrder = (item: PurchaseOrder): void => {
    navigate(`/init/overview/purchase-order/${item.nroOrder}`);
  };

  useEffect(() => {
    getPurchaseOrders();
  }, []);

  return (
    <TemplateLayout key="overview-vehicles" viewMap={true}>
      {isLoading && <Loading loading={true} />}
      <Box
        component="div"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ ml: { sm: 2 }, pt: 2, pr: 2 }}
      >
        <Box display="flex" alignItems="center">
          <Icon name="list alternate outline" size="large" />
          <Typography component="h2" variant="h4" sx={{ ml: { sm: 2 } }}>
            {t("purchase_order")}
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
              onClick={onClickNewPurchaseOrder}
            >
              {t("add_new")}
            </Button>
          </Grid>
          <Grid item xs={12} sm={10}>
            <Grid container justifyContent="flex-end">
              <Grid item xs={8} sm={7}>
                <TextField
                  variant="outlined"
                  type="text"
                  size="small"
                  placeholder={"OC"}
                  autoComplete="off"
                  name="filterText"
                  value={filterText}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start" />,
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={4} sm={3}>
                <Button
                  variant="contained"
                  color="primary"
                  size="medium"
                  fullWidth
                  sx={{
                    height: "98%",
                    margin: "auto",
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                  }}
                  // onClick={() => onClickBuscar()}
                  startIcon={<SearchIcon />}
                >
                  {t("icon_search")}
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Box component="div" sx={{ p: 1 }}>
          <DataTable
            key="datatable-purchase-orders"
            columns={columns}
            isLoading={isLoading}
          >
            {purchaseOrders.map(({ order, details }) => (
              <ItemRow>
                <TableCellStyled align="center">
                  {order.creationDate}
                </TableCellStyled>
                <TableCellStyled align="center">{order.nroOrder} </TableCellStyled>
                <TableCellStyled align="center">{order.businessName}</TableCellStyled>
                <TableCellStyled align="right">{Helper.parseDecimalPointToComaWithCurrency(order.totalValue, "$", 2)}</TableCellStyled>
                <TableCellStyled align="center">
                  <Tooltip title={t("icon_edit")}>
                    <IconButton
                      aria-label={t("icon_edit")}
                      onClick={() => onClickUpdatePurchaseOrder(order)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  {/* <Tooltip title={t("icon_delete")}>
                    <IconButton
                      // onClick={() =>  handleDeleteVehicle (row)}
                      style={{ fontSize: '1rem' }}
                    >
                      <Icon name="trash alternate" />
                    </IconButton>
                  </Tooltip> */}
                  {/* <Button
                    variant="contained"
                    href={instance.url || "#"}
                    target='_blank'
                    download={`purchase-order-${row.nroOrder}.pdf`}
                    color="primary"
                  >
                    <PrintIcon />
                  </Button> */}
                  <PDFDownloadLink
                    document={<PurchaseOrderPDF purchaseOrder={order} details={details} />}
                    fileName={`purchase-order-${order.nroOrder}.pdf`}>
                    {({ blob, url, loading, error }) =>
                      (order && !loading) ? <PrintIcon /> : ''
                    }
                  </PDFDownloadLink>
                </TableCellStyled>
              </ItemRow>
            ))}
          </DataTable>
        </Box>
      </Box>
    </TemplateLayout>
  );
};
