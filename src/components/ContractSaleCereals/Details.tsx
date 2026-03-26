import {
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
  List,
  ListItem,
  Paper,
  Divider
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import React, { useState, ChangeEvent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ContractSaleCereal } from '../../interfaces/contract-sale-cereals';
import { FormValueState } from '../../hooks';
import { BusinessItem } from '../../interfaces/socialEntity';
import { Geolocation, OriginDestinations } from '../../types';
import { AddDestinationDialog } from './AddDestinationDialog';
import dayjs from 'dayjs';
import { Company } from '../../interfaces/company';


interface Props {
  formValues: FormValueState<ContractSaleCereal>;
  providers: BusinessItem[];
  destinations: OriginDestinations[];
  companies: Company[];
  listDeliveryDates: string[];
  handleInputChange: ({ target }: ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: ({ target }: SelectChangeEvent) => void;
  handleFormValueChange: (key: string, value: string) => void;
  addDeliveryDate: (date: string) => void;
  deleteDeliveryDate: (date: string) => void;
  onDestinationCreated: (name: string, geolocation: Geolocation) => Promise<void>;
}  // handleCheckboxChange: ({ target }: ChangeEvent<HTMLInputElement>, checked: boolean) => void;

const initialDate = dayjs().add(1, "day").format("YYYY-MM-DD");

export const Details: React.FC<Props> = ({
  formValues,
  providers,
  destinations,
  listDeliveryDates,
  companies,
  handleInputChange,
  handleSelectChange,
  handleFormValueChange,
  addDeliveryDate,
  deleteDeliveryDate,
  onDestinationCreated,
}) => {

  const { t } = useTranslation();
  const [newDate, setNewDate] = useState<string>(initialDate);
  const [destDialogOpen, setDestDialogOpen] = useState(false);

  const minDate = useMemo(() => {
    let dateMax = initialDate;
    listDeliveryDates.forEach((date) => {
      if (dayjs(date).isAfter(dateMax)) dateMax = date;
    });

    return dayjs(dateMax).add(1, "day").format("YYYY-MM-DD");
  }, [listDeliveryDates]);

  const handleAddNewDeliveryDate = () => {
    addDeliveryDate(newDate);
    setNewDate("");
  }

  return (
    <Grid container spacing={1} >
      <Grid item xs={12} sm={9.5} px={1}>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={12} sm={3}>
            <FormControl key="producer-select"
              error={formValues.campaignId.isError}
              fullWidth>
              <InputLabel id="producer">{t("producer_seller")}</InputLabel>
              <Select
                labelId="producer"
                name="producerId"
                value={formValues.producerId.value}
                label={t("producer_seller")}
                onChange={handleSelectChange}
              >
                {companies.map((c) => (
                  <MenuItem key={c._id} value={c._id}>
                    {c.socialReason}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{formValues.producerId.message}</FormHelperText>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl key="buyer-select"
              error={formValues.buyerId.isError}
              fullWidth>
              <InputLabel id="buyer">{t("buyer_recipient")}</InputLabel>
              <Select
                labelId="buyer"
                name="buyerId"
                value={formValues.buyerId.value}
                label={t("buyer_recipient")}
                onChange={handleSelectChange}
              >
                {providers.map((c) => (
                  <MenuItem key={c._id} value={c._id}>
                    {c.razonSocial || "-"}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{formValues.buyerId.message}</FormHelperText>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl key="destination-select"
              error={formValues.destinationId.isError}
              fullWidth>
              <InputLabel id="destination">{t("_destination")}</InputLabel>
              <Select
                labelId="destination"
                name="destinationId"
                value={formValues.destinationId.value}
                label={t("_destination")}
                onChange={handleSelectChange}
                endAdornment={
                  <InputAdornment position="end" sx={{ mr: 2 }}>
                    <IconButton
                      size="small"
                      onClick={() => setDestDialogOpen(true)}
                      title={t("_add")}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                }
              >
                {destinations?.map((item) => (
                  <MenuItem key={item._id} value={item._id}>
                    {item.name || "-"}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{formValues.destinationId.message}</FormHelperText>
            </FormControl>
          </Grid>

          <AddDestinationDialog
            open={destDialogOpen}
            onClose={() => setDestDialogOpen(false)}
            onSave={onDestinationCreated}
          />
          <Grid item xs={12} sm={3}>
            <FormControl key="deliverer-select"
              error={formValues.delivererId.isError}
              fullWidth>
              <InputLabel id="deliverer">{t("deliverer")}</InputLabel>
              <Select
                labelId="deliverer"
                name="delivererId"
                value={formValues.delivererId.value}
                label={t("deliverer")}
                onChange={handleSelectChange}
              >
                {providers?.map((item) => (
                  <MenuItem key={item._id} value={item._id}>
                    {item.razonSocial || "-"}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{formValues.delivererId.message}</FormHelperText>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl key="broker-select"
              error={formValues.brokerId.isError}
              fullWidth>
              <InputLabel id="broker">{t("broker")}</InputLabel>
              <Select
                labelId="broker"
                name="brokerId"
                value={formValues.brokerId.value}
                label={t("broker")}
                onChange={handleSelectChange}
              >
                {providers?.map((item) => (
                  <MenuItem key={item._id} value={item._id}>
                    {item.razonSocial || "-"}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{formValues.brokerId.message}</FormHelperText>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={1}>
            <TextField
              type="number"
              variant="outlined"
              label="%"
              name="brokerPercentage"
              value={formValues.brokerPercentage.value}
              inputProps={{ style: { textAlign: 'right' } }}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '') {
                  handleFormValueChange("brokerPercentage", '0');
                } else {
                  const numValue = Number(value);
                  handleFormValueChange("brokerPercentage", numValue >= 0 ? numValue.toString() : '0');
                }
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              type="number"
              variant="outlined"
              label={t("_amount")}
              name="brokerAmountValue"
              value={formValues.brokerAmountValue.value}
              inputProps={{ style: { textAlign: 'right' } }}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '') {
                  handleFormValueChange("brokerAmountValue", '0');
                } else {
                  const numValue = Number(value);
                  handleFormValueChange("brokerAmountValue", numValue >= 0 ? numValue.toString() : '0');
                }
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl key="comission-select"
              error={formValues.brokerId.isError}
              fullWidth>
              <InputLabel id="comission-agent">{t("commission_agent")}</InputLabel>
              <Select
                labelId="comission-agent"
                name="comissionAgentId"
                value={formValues.comissionAgentId.value}
                label={t("commission_agent")}
                onChange={handleSelectChange}
              >
                {providers?.map((item) => (
                  <MenuItem key={item._id} value={item._id}>
                    {item.razonSocial || "-"}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{formValues.comissionAgentId.message}</FormHelperText>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={1}>
            <TextField
              type="number"
              variant="outlined"
              label="%"
              name="comissionAgentPercentage"
              value={formValues.comissionAgentPercentage.value}
              inputProps={{ style: { textAlign: 'right' } }}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '') {
                  handleFormValueChange("comissionAgentPercentage", '0');
                } else {
                  const numValue = Number(value);
                  handleFormValueChange("comissionAgentPercentage", numValue >= 0 ? numValue.toString() : '0');
                }
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              type="number"
              variant="outlined"
              label={t("_amount")}
              name="comissionAgentAmountValue"
              inputProps={{ style: { textAlign: 'right' } }}
              value={formValues.comissionAgentAmountValue.value}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '') {
                  handleFormValueChange("comissionAgentAmountValue", '0');
                } else {
                  const numValue = Number(value);
                  handleFormValueChange("comissionAgentAmountValue", numValue >= 0 ? numValue.toString() : '0');
                }
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={12}>
            <TextField
              type="text"
              variant='outlined'
              multiline
              maxRows={4}
              label={t("_condition")}
              name="condition"
              value={formValues.condition.value}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={12}>
            <TextField
              type="text"
              variant='outlined'
              multiline
              maxRows={4}
              label={t("payment_method")}
              name="mothodPayment"
              value={formValues.mothodPayment.value}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} sm={2.5} component={Paper}>
        <Typography variant="h6" align='center' mb={1} sx={{ letterSpacing: "1px", fontWeight: "600" }}>
          {t("_deliveries")}
        </Typography>
        <Grid container spacing={1} alignItems="center" >
          <Grid
            item
            xs={12}
            sm={12}
            mb={1}
            className='d-flex justify-content-center align-items-center'>
            <TextField
              variant="outlined"
              type="date"
              value={newDate}
              inputProps={{ min: minDate }}
              onChange={(e) => setNewDate(e.target.value)}
              fullWidth
            />
            <IconButton
              color="success"
              aria-label="add"
              size="medium"
              disabled={!newDate}
              onClick={() => handleAddNewDeliveryDate()}
            >
              <AddIcon />
            </IconButton>
          </Grid>
          <Grid item xs={12} sm={12} >
            <Divider />
            <List dense={false} sx={{
              maxHeight: "220px",
              overflow: "auto",
            }}>
              {listDeliveryDates.map((item) => (
                <ListItem
                  key={item}
                  secondaryAction={
                    <IconButton
                      onClick={() => deleteDeliveryDate(item)}
                      edge="end"
                      aria-label="delete">
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <TextField
                    variant="outlined"
                    type="date"
                    value={item}
                    fullWidth
                  />
                </ListItem>)
              )}
            </List>
          </Grid>
        </Grid>
      </Grid>
    </Grid>

  )
}
