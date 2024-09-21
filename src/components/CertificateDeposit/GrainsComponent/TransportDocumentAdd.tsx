import { useState } from "react";
import { useForm } from "../../../hooks";
import { TransportDocument, TransportDocumentItem } from "../../../interfaces/transportDocument";
import { FormControl, Grid, IconButton, InputAdornment, InputLabel, ListItemText, MenuItem, Paper, Select, SelectChangeEvent, TextField, Typography } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { TransportDocumentByCertificateDeposit } from "../../../interfaces/certificate-deposit";


interface TransportDocumentAddProps {
    listTransportDocument: TransportDocumentItem[];
    addTransportDocument: (transportByCert: TransportDocumentByCertificateDeposit) => void;
}

export const TransportDocumentAdd: React.FC<TransportDocumentAddProps> = ({
    listTransportDocument,
    addTransportDocument
}) => {

    const {
        formulario: formValue,
        handleSelectChange,
        handleInputChange,
        setFormulario,
        reset
    } = useForm<TransportDocumentByCertificateDeposit>({
        numeroCertificado: "",
        numeroCartaPorte: "",
        fechaCartaPorte: "",
        kgNeto: 0,
        kgMermaZarandeo: 0,
        tarifaZarandeo: 0,
        importeZarandeo: 0,
        humedadSecado: 0,
        kgMermaSecado: 0,
        tarifaSecado: 0,
        importeSecado: 0,
    });
    const [selectedTransport, setSelectedTransport] = useState<TransportDocumentItem | null>(null);

    const onChangeTransportDocument = (e: SelectChangeEvent) => {
        const transportDocumentFound = listTransportDocument.find((item) => item.nroCartaPorte === e.target.value);
        if (!transportDocumentFound) return;
        handleSelectChange(e);
        setSelectedTransport(transportDocumentFound);
        setFormulario(prevState => ({
            ...prevState,
            kgNeto: transportDocumentFound.kgNeto,
            fechaCartaPorte: transportDocumentFound.fechaEmision,
        }));
    }

    return (
        <Grid container spacing={1}>
            <Grid item xs={12} sm={3}>
                <FormControl
                    key="transport-select"
                    fullWidth>
                    <InputLabel id="transport">Carta Porte N°</InputLabel>
                    <Select
                        labelId="transport"
                        name="numeroCartaPorte"
                        value={formValue.numeroCartaPorte} //CUIT 
                        label="Carta Porte N°"
                        onChange={onChangeTransportDocument}
                    >
                        {listTransportDocument.map((transport) => (
                            <MenuItem key={transport._id} value={transport.nroCartaPorte}>
                                {transport.nroCartaPorte}
                            </MenuItem>
                        ))}
                    </Select>

                </FormControl>
            </Grid>
            <Grid item xs={6} sm={3}>
                <ListItemText
                    key="date-transport"
                    sx={{ backgroundColor: "#f4f4f4", px: 1 }}
                    primary={<Typography variant='subtitle2'>Fecha</Typography>}
                    secondary={
                        <Typography letterSpacing={1} fontWeight={600} variant='subtitle1'>
                            {selectedTransport ? selectedTransport.fechaEmision : "-"}
                        </Typography>}
                />
            </Grid>
            <Grid item xs={6} sm={3}>
                <TextField
                    variant="outlined"
                    type="number"
                    label="Kg Neto"
                    name="kgNeto"
                    value={formValue.kgNeto}
                    InputProps={{ startAdornment: <InputAdornment position="start" /> }}
                    onChange={handleInputChange}
                    fullWidth
                />
            </Grid>
            <Grid item xs={12} sm={5} >
                <Grid container spacing={1} component={Paper} sx={{ pb: 1, px: 1 }}>
                    <Grid item xs={12} sm={12} display="flex" justifyContent="center" >
                        <Typography variant='h6' fontWeight="bold" mb={1} sx={{ letterSpacing: "1px" }}>Zarandeo</Typography>
                    </Grid>

                    <Grid item xs={6} sm={4}>
                        <TextField
                            variant="outlined"
                            type="number"
                            label="Merma Kg"
                            name="kgMermaZarandeo"
                            value={formValue.kgMermaZarandeo}
                            InputProps={{ startAdornment: <InputAdornment position="start" /> }}
                            onChange={handleInputChange}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={6} sm={4}>
                        <TextField
                            variant="outlined"
                            type="number"
                            label="Tarifa"
                            name="tarifaZarandeo"
                            value={formValue.tarifaZarandeo}
                            onChange={handleInputChange}
                            fullWidth
                            InputProps={{
                                startAdornment: <InputAdornment position="start" >$</InputAdornment>,
                            }}
                        />
                    </Grid>
                    <Grid item xs={6} sm={4}>
                        <TextField
                            variant="outlined"
                            type="number"
                            label="Importe"
                            name="importeZarandeo"
                            value={formValue.importeZarandeo}
                            onChange={handleInputChange}
                            fullWidth
                            InputProps={{
                                startAdornment: <InputAdornment position="start" >$</InputAdornment>,
                            }}
                        />
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={12} sm={6} >
                <Grid container spacing={1} component={Paper} sx={{ pb: 1, px: 1 }}>
                    <Grid item xs={12} sm={12} display="flex" justifyContent="center" >
                        <Typography variant='h6' fontWeight="bold" mb={1} sx={{ letterSpacing: "1px" }}>Secado</Typography>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <TextField
                            variant="outlined"
                            type="number"
                            label="% Humedad"
                            name="humedadSecado"
                            value={formValue.humedadSecado}
                            InputProps={{ startAdornment: <InputAdornment position="start" /> }}
                            onChange={handleInputChange}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <TextField
                            variant="outlined"
                            type="number"
                            label="Merma Kg"
                            name="kgMermaSecado"
                            value={formValue.kgMermaSecado}
                            InputProps={{ startAdornment: <InputAdornment position="start" /> }}
                            onChange={handleInputChange}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <TextField
                            variant="outlined"
                            type="number"
                            label="Tarifa"
                            name="tarifaSecado"
                            value={formValue.tarifaSecado}
                            onChange={handleInputChange}
                            fullWidth
                            InputProps={{
                                startAdornment: <InputAdornment position="start" >$</InputAdornment>,
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <TextField
                            variant="outlined"
                            type="number"
                            label="Importe"
                            name="importeSecado"
                            value={formValue.importeSecado}
                            onChange={handleInputChange}
                            fullWidth
                            InputProps={{
                                startAdornment: <InputAdornment position="start" >$</InputAdornment>,
                            }}
                        />
                    </Grid>
                </Grid>
            </Grid>
            <Grid
                item
                xs={12}
                sm={1}
                display="flex"
                justifyContent="center"
                alignItems="center">
                <IconButton onClick={() => {
                    addTransportDocument(formValue);
                    reset();
                }
                } color="success" size='large'>
                    <AddIcon fontSize='large' />
                </IconButton>
            </Grid>

        </Grid>
    );
}