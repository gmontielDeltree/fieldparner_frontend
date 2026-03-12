import {
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
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
import { OriginDestinations } from '../../types';
import dayjs from 'dayjs';
import { Company } from '../../interfaces/company';

//TODO: Cambiar los textos a idioma seleccionado

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
}) => {

  const { t } = useTranslation();
  const [newDate, setNewDate] = useState<string>(initialDate);

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
              <InputLabel id="producer">Productor/Vendedor</InputLabel>
              <Select
                labelId="producer"
                name="producerId"
                value={formValues.producerId.value}
                label="Productor/Vendedor"
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
              <InputLabel id="buyer">Comprador/Destinatario</InputLabel>
              <Select
                labelId="buyer"
                name="buyerId"
                value={formValues.buyerId.value}
                label="Comprador/Destinatario"
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
              <InputLabel id="destination">Destino</InputLabel>
              <Select
                labelId="destination"
                name="destinationId"
                value={formValues.destinationId.value}
                label="Destino"
                onChange={handleSelectChange}
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
          <Grid item xs={12} sm={3}>
            <FormControl key="deliverer-select"
              error={formValues.delivererId.isError}
              fullWidth>
              <InputLabel id="deliverer">Entregador</InputLabel>
              <Select
                labelId="deliverer"
                name="delivererId"
                value={formValues.delivererId.value}
                label="Entregador"
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
              <InputLabel id="broker">Corredor</InputLabel>
              <Select
                labelId="broker"
                name="brokerId"
                value={formValues.brokerId.value}
                label="Corredor"
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
              label="Importe"
              name="brokerAmountValue"
              value={formValues.brokerAmountValue.value}
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
              <InputLabel id="comission-agent">Comisionista</InputLabel>
              <Select
                labelId="comission-agent"
                name="comissionAgentId"
                value={formValues.comissionAgentId.value}
                label="Comisionista"
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
              label="Importe"
              name="comissionAgentAmountValue"
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
              label="Condicion"
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
              label="Forma de Pago"
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
          Entregas
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
