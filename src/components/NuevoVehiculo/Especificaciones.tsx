import React, { ChangeEvent } from "react";
import {
  Box,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";
import { RowData, TipoCombustible, Vehicle } from "../../types";
import { FolderOpen as FolderOpenIcon } from "@mui/icons-material";
import EspecificationTable from "../DataTable/EspecificationTable";

const tipoCombustibles: string[] = Object.keys(TipoCombustible);

const columns = ["Especificacion", "Descripcion"];

export interface EspecificacionesProps {
  vehiculo: Vehicle;
  setVehiculo: React.Dispatch<React.SetStateAction<Vehicle>>;
  handleInputChange: ({ target }: ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: ({ target }: SelectChangeEvent) => void;
}

export const Especificaciones: React.FC<EspecificacionesProps> = ({
  vehiculo,
  handleInputChange,
  handleSelectChange,
  setVehiculo,
}) => {
  // const [especificaciones, setEspecificaciones] = useState<RowData[]>([
  //     { name: 'Servicio', description: 'Cambio de aceite cada 10.000km' }
  // ]);

  const {
    fuelType,
    fuelCapacity,
    unitMeasurement,
    connectivity,
    tara,
    gross,
    net,
    technialSpecifications
  } = vehiculo;

  const handleAgregarEspecificacion = (row: RowData) => {
    setVehiculo((prevState) => ({
      ...prevState,
      technialSpecifications: [row, ...prevState.technialSpecifications],
    }));
  };

  const handleEliminarEspecificacion = (row: RowData) => {
    setVehiculo((prevState) => ({
      ...prevState,
      technialSpecifications: prevState.technialSpecifications.filter(
        (x) => x.name !== row.name
      ),
    }));
  };

  return (
    <>
      <Box display="flex" alignItems="center" sx={{ m: 1, mb: 2 }}>
        <FolderOpenIcon sx={{ mx: 1 }} />
        <Typography variant="h5">Características</Typography>
      </Box>
      <Grid
        container
        spacing={3}
        direction="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Grid item xs={12} sm={4}>
          <TextField
            label="Tara"
            variant="outlined"
            type="number"
            name="tara"
            inputProps={{ min: "0" }}
            value={tara === 0 ? "" : tara}
            InputProps={{
              endAdornment: <InputAdornment position="end">kg</InputAdornment>,
            }}
            onChange={handleInputChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Bruto"
            variant="outlined"
            type="number"
            name="gross"
            inputProps={{ min: "0" }}
            value={gross === 0 ? "" : gross}
            InputProps={{
              endAdornment: <InputAdornment position="end">kg</InputAdornment>,
            }}
            onChange={handleInputChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Neto"
            variant="outlined"
            type="number"
            name="net"
            inputProps={{ min: "0" }}
            value={net === 0 ? "" : net}
            InputProps={{
              endAdornment: <InputAdornment position="end">kg</InputAdornment>,
            }}
            onChange={handleInputChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel id="tipo-combustible">Tipo Combustible</InputLabel>
            <Select
              labelId="tipo-combustible"
              id="select-combustible"
              name="fuelType"
              value={fuelType}
              label="Tipo Combustible"
              onChange={handleSelectChange}
            >
              {tipoCombustibles.map((value) => (
                <MenuItem key={value} value={value}>
                  {value.toString()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Capacidad de Combustible"
            variant="outlined"
            type="number"
            name="fuelCapacity"
            inputProps={{ min: "0" }}
            value={fuelCapacity === 0 ? "" : fuelCapacity}
            InputProps={{
              endAdornment: <InputAdornment position="end">L</InputAdornment>,
            }}
            onChange={handleInputChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Unidad de Medida"
            variant="outlined"
            type="text"
            name="unitMeasurement"
            value={unitMeasurement}
            onChange={handleInputChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Conectividad"
            variant="outlined"
            type="text"
            name="connectivity"
            value={connectivity}
            onChange={handleInputChange}
            fullWidth
          />
        </Grid>
        {/* <Grid item xs={12} sm={1} justifyContent="flex-start">
                    <Fab
                        color="success"
                        aria-label="add"
                        size='medium'
                        onClick={() => handleAgregarEspecificacion()}
                    >
                        <AddIcon />
                    </Fab>
                </Grid> */}
      </Grid>
      <Box component="div" sx={{ mt: 3 }}>
        <EspecificationTable
          key="tabla-especificaciones-tecnicas"
          columns={columns}
          rows={technialSpecifications}
          handleAddRow={handleAgregarEspecificacion}
          deleteRow={handleEliminarEspecificacion}
        />
      </Box>
    </>
  );
};
