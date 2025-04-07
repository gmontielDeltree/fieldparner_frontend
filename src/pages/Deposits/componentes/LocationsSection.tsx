import React from "react";
import {
  Container,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Fab,
  Tooltip,
  IconButton,
  TextField,
  Paper,
  styled,
} from "@mui/material";
import { FormSection } from "../../../components";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import {LocationsSectionProps} from "./types";
import { tableCellClasses } from "@mui/material/TableCell";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    padding: "5px",
    fontSize: 14,
  },
}));


export const LocationsSection: React.FC<LocationsSectionProps> = ({
  formulario,
  setFormulario,
}) => {
  const { t } = useTranslation();
  const [location, setLocation] = React.useState("");

  const isDuplicateLocation = (newLocation: string) => {
    return formulario.locations.some(
      (loc) => loc.trim().toLowerCase() === newLocation.trim().toLowerCase()
    );
  };

  const handleAddLocation = () => {
    if (!location.trim()) {
      Swal.fire({
        title: t("validation_error"),
        text: t("location_cannot_be_empty"),
        icon: "error",
      });
      return;
    }
    if (isDuplicateLocation(location)) {
      Swal.fire({
        title: t("validation_error"),
        text: t("location_already_exists"),
        icon: "error",
      });
      return;
    }
    setFormulario((prev) => ({
      ...prev,
      locations: [location, ...prev.locations],
    }));
    setLocation("");
  };

  const handleDeleteLocation = (item: string) => {
    setFormulario((prev) => ({
      ...prev,
      locations: prev.locations.filter(
        (l) => l.trim().toLowerCase() !== item.trim().toLowerCase()
      ),
    }));
  };

  const locationDefault = t("_general");

  return (
    <FormSection title={t("locations_within_the_depot")}>
      <Container maxWidth="md">
        <TableContainer component={Paper}>
          <Table aria-label="locations table">
            <TableHead>
              <TableRow>
                <StyledTableCell>{t("locations_within_the_depot")}</StyledTableCell>
                <StyledTableCell align="center">{t("actions")}</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <StyledTableCell>
                  <TextField
                    name="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    fullWidth
                  />
                </StyledTableCell>
                <StyledTableCell align="center">
                  <Fab color="success" size="small" onClick={handleAddLocation}>
                    <AddIcon />
                  </Fab>
                </StyledTableCell>
              </TableRow>
              {formulario.locations.map((loc) => (
                <TableRow key={loc}>
                  <TableCell
                    sx={{
                      p: "5px",
                      height: "50px",
                      minWidth: 350,
                      maxWidth: 450,
                    }}
                  >
                    {loc}
                  </TableCell>
                  <TableCell align="center" sx={{ p: "5px" }}>
                    <Tooltip title={t("icon_delete")}>
                      <IconButton
                        disabled={loc.toLowerCase() === locationDefault.toLowerCase()}
                        onClick={() => handleDeleteLocation(loc)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </FormSection>
  );
};