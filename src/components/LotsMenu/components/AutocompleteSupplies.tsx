import React, { useEffect, useMemo, useState } from "react";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import { useTranslation } from "react-i18next";
import { ContractorRepository } from "../../../classes/ContractorRepository";
import { Business, Supply, UnidadesDeMedida, TypeSupplies } from "../../../types";
import { SuppliesRepository } from "../../../classes/SuppliesRepository";
import { paramsToObject } from "lightgallery/plugins/video/lg-video-utils";
import {
  Box,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Select,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Paper,
  FormHelperText,
} from "@mui/material";
import FilterAltTwoToneIcon from "@mui/icons-material/FilterAltTwoTone";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const filter = createFilterOptions<FilmOptionType>({ limit: 50 });

interface SupplyOptionType extends Supply {
  inputValue?: string;
}

export const AutocompleteSupplies = ({ value, onChange, activityType }) => {
  const [_value, setValue] = React.useState<SupplyOptionType | null>(value);
  const [open, toggleOpen] = React.useState(false);
  const { t } = useTranslation();

  // Get activity color based on type
  const getActivityColor = () => {
    switch (activityType) {
      case 'siembra':
      case 'sowing':
        return '#10b981';
      case 'aplicacion':
      case 'application':
        return '#3b82f6';
      case 'cosecha':
      case 'harvesting':
        return '#f59e0b';
      case 'preparado':
      case 'preparation':
        return '#6b7280';
      default:
        return '#3b82f6'; // Default blue color
    }
  };

  const activityColor = getActivityColor();

  const [supplyRepo, _] = useState(new SuppliesRepository());
  const [supplies, setSupplies] = useState<Supply[]>([]);

  const [selectedTypesFilter, setSelectedTypesFilter] = useState<string[]>([]);

  const [dialogValue, setDialogValue] = React.useState({
    name: "",
    type: "",
    replenishmentPoint: "",
    unitMeasurement: "",
  });

  useEffect(() => {
    supplyRepo.getAll().then((cropsFromDB) => {
      console.log("Supplies", cropsFromDB);
      setSupplies(cropsFromDB);
    });

    supplyRepo.attachObserver((cropsFromDB) => {
      // console.log("Settin Crops Again");
      setSupplies(cropsFromDB);
    });
  }, []);

  const handleClose = () => {
    setDialogValue({
      name: "",
      type: "",
      replenishmentPoint: "",
      unitMeasurement: "",
    });
    toggleOpen(false);
  };

  useEffect(() => {
    // console.log("_value",_value)
    onChange(_value);
  }, [_value]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Save new contractor
    supplyRepo
      .add({
        name: dialogValue.name,
        type: dialogValue.type,
        replenishmentPoint: dialogValue.replenishmentPoint,
        unitMeasurement: dialogValue.unitMeasurement,
      })
      .then((doc) => {
        setValue(doc);
      });

    handleClose();
  };

  return (
    <React.Fragment>
      <Autocomplete
        value={_value}
        onChange={(event, newValue) => {
          if (typeof newValue === "string") {
            // timeout to avoid instant validation of the dialog's form.
            setTimeout(() => {
              toggleOpen(true);
              setDialogValue({
                name: newValue,
              });
            });
          } else if (newValue && newValue.inputValue) {
            toggleOpen(true);
            setDialogValue({
              name: newValue.inputValue,
            });
          } else {
            setValue(newValue);
          }
        }}
        filterOptions={(options, params) => {
          const filteredOptions1 = options.filter((o) =>
            selectedTypesFilter.includes(o.type)
          );
          console.log("FITRO", selectedTypesFilter, options, filteredOptions1);

          const filtered = filter(filteredOptions1, params);

          if (params.inputValue !== "") {
            filtered.push({
              inputValue: params.inputValue,
              name: `${t("_add")} "${params.inputValue}"`,
            });
          }

          return filtered;
        }}
        id="free-solo-dialog-demo"
        options={supplies}
        getOptionLabel={(option) => {
          // e.g. value selected with enter, right from the input

          if (typeof option === "string") {
            return option;
          }
          if (option.inputValue) {
            return option.inputValue;
          }

          return option?.name;
        }}
        selectOnFocus
        clearOnBlur
        handleHomeEndKeys
        renderOption={(props, option) => (
          <Box

            {...props}
            key={option?._id}
          >
            <div style={{width:"100%"}}>
              <Box>
                <Typography variant="subtitle1">{option?.name}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">{option?.brand}</Typography>
              </Box>
            </div>

            {/* <Box>
              <ul>
                <li>
                  {t("_active_ingredient")}: {option?.activePrincipal}
                </li>
              </ul>
            </Box> */}

            {/* <Typography variant="body2" component="div">
              {option?.description}
            </Typography> */}

            { option?.type && <div>
              <Chip label={option?.type} size="small" />
            </div>}
            <Divider/>
          </Box>
        )}
        freeSolo
        renderInput={(
          params //<TextField {...params} label={t("_contractor")} />
        ) => (
          <SuppliesTextInputWithFilterButton
            {...params}
            supplies={supplies}
            onChangeFilter={(e) => {
              console.log("CHANGE filter#1", e);
              setSelectedTypesFilter(e);
            }}
          />
        )}
      />
      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          }
        }}
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ 
            background: activityColor,
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            padding: '1.5rem',
          }}>
            <AddCircleOutlineIcon sx={{ fontSize: 30 }} />
            {t("_quick_add")} {t("_supply")}
          </DialogTitle>
          <DialogContent sx={{ mt: 3, px: 3 }}>
            <Box sx={{ 
              mb: 3, 
              p: 2, 
              backgroundColor: '#f8f9fa',
              borderRadius: 2,
              border: '1px solid #e0e0e0'
            }}>
              <Typography variant="body2" color="text.secondary" sx={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 1 
              }}>
                <InfoOutlinedIcon fontSize="small" />
                {t("you_can_edit_more_details_later_in_the_supplies_menu_on_the_sidebar")}
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel id="tipo-insumo-quick">{t("_type")}</InputLabel>
                  <Select
                    labelId="tipo-insumo-quick"
                    value={dialogValue.type}
                    label={t("_type")}
                    onChange={(event) =>
                      setDialogValue({
                        ...dialogValue,
                        type: event.target.value,
                      })
                    }
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: activityColor,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: activityColor,
                        },
                      },
                    }}
                  >
                    {TypeSupplies().map((supply) => (
                      <MenuItem key={supply} value={supply}>
                        {supply}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  autoFocus
                  required
                  fullWidth
                  value={dialogValue.name}
                  onChange={(event) =>
                    setDialogValue({
                      ...dialogValue,
                      name: event.target.value,
                    })
                  }
                  label={t("_supply")}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#667eea',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#667eea',
                      },
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  value={dialogValue.replenishmentPoint}
                  onChange={(event) =>
                    setDialogValue({
                      ...dialogValue,
                      replenishmentPoint: event.target.value,
                    })
                  }
                  label={t("reorder_point")}
                  variant="outlined"
                  type="number"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#667eea',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#667eea',
                      },
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="unidad-medida-quick">{t("unit_of_measure")}</InputLabel>
                  <Select
                    labelId="unidad-medida-quick"
                    value={dialogValue.unitMeasurement}
                    label={t("unit_of_measure")}
                    onChange={(event) =>
                      setDialogValue({
                        ...dialogValue,
                        unitMeasurement: event.target.value,
                      })
                    }
                    MenuProps={{ PaperProps: { style: { maxHeight: 200 } } }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: activityColor,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: activityColor,
                        },
                      },
                    }}
                  >
                    {UnidadesDeMedida().map((um, index) => (
                      <MenuItem key={`${um}-${index}`} value={um}>
                        {um}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ 
            px: 3, 
            pb: 3, 
            pt: 2,
            gap: 1 
          }}>
            <Button 
              onClick={handleClose}
              variant="outlined"
              sx={{ 
                borderRadius: 2,
                px: 3,
                borderColor: '#6b7280',
                color: '#6b7280',
                '&:hover': {
                  borderColor: '#4b5563',
                  backgroundColor: 'rgba(107, 114, 128, 0.04)',
                }
              }}
            >
              {t("_Cancel")}
            </Button>
            <Button 
              type="submit"
              variant="contained"
              sx={{ 
                borderRadius: 2,
                px: 3,
                background: '#10b981',
                '&:hover': {
                  background: '#059669',
                }
              }}
            >
              {t("_Add")}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </React.Fragment>
  );
};

const SuppliesTextInputWithFilterButton: React.FC = (props) => {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);

  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const typesFromSupplies = useMemo(() => {
    if (!props.supplies) return [];
    let types = new Set<string>(props.supplies.map((s) => s.type));
    setSelectedFilters([...types]);
    return [...types];
  }, [props.supplies]);

  const listOfFilters = typesFromSupplies || ["Semillas", "Combustibles"];

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const onFilterClick = (option) => {
    // Toggle categories
    if (selectedFilters.includes(option)) {
      console.log("removing", option);
      setSelectedFilters(selectedFilters.filter((f) => f !== option));
    } else {
      console.log("adding", option);

      setSelectedFilters([...selectedFilters, option]);
    }
  };

  useEffect(() => {
    if (props.onChangeFilter) {
      props.onChangeFilter(selectedFilters);
    }
  }, [selectedFilters]);

  const handleAllClick = () => {
    setSelectedFilters(typesFromSupplies);
  };

  const handleNoneClick = () => {
    setSelectedFilters([]);
  };

  return (
    <>
      <TextField
        {...props}
        label={t("_supply")}
        InputProps={{
          ...props.InputProps,
          startAdornment: (
            <InputAdornment position="start">
              <IconButton onClick={handleClick} edge="end">
                {<FilterAltTwoToneIcon />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
        sx={{
          "& .Mui-selected": { fontWeight: "bold" },
        }}
      >
        {/* Crop selector */}
        {/* <MenuItem
          onClick={() => onFilterClick(filter)}
          selected={selectedFilters.includes(filter)}
        >
          <Select size="small" label={t("_crops")}>
            <MenuItem>Maiz</MenuItem>
            <MenuItem>Cerdo</MenuItem>
          </Select>
        </MenuItem> */}

        <MenuItem>
          <Box>
            <Button onClick={handleAllClick}> {t("_all")}</Button>{" "}
            <Button onClick={handleNoneClick}> {t("_none")}</Button>
          </Box>
        </MenuItem>

        {/* Regular Categories */}
        {listOfFilters.map((filter) => (
          <MenuItem
            onClick={() => onFilterClick(filter)}
            selected={selectedFilters.includes(filter)}
          >
            {filter}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
