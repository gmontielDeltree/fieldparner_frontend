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
import { Business, Supply } from "@types";
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
} from "@mui/material";
import FilterAltTwoToneIcon from "@mui/icons-material/FilterAltTwoTone";

const filter = createFilterOptions<FilmOptionType>({ limit: 50 });

interface SupplyOptionType extends Supply {
  inputValue?: string;
}

export const AutocompleteSupplies = ({ value, onChange }) => {
  const [_value, setValue] = React.useState<SupplyOptionType | null>(value);
  const [open, toggleOpen] = React.useState(false);
  const { t } = useTranslation();

  const [supplyRepo, _] = useState(new SuppliesRepository());
  const [supplies, setSupplies] = useState<Supply[]>([]);

  const [selectedTypesFilter, setSelectedTypesFilter] = useState<string[]>([]);

  const [dialogValue, setDialogValue] = React.useState({
    name: "",
    type: "",
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
      <Dialog open={open} onClose={handleClose}>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            t{"_quick_add"} t{"_supply"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              {t(
                "you_can_edit_more_details_later_in_the_supplies_menu_on_the_sidebar"
              )}
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              value={dialogValue.name}
              onChange={(event) =>
                setDialogValue({
                  ...dialogValue,
                  name: event.target.value,
                })
              }
              label={t("name")}
              type="text"
              variant="standard"
            />

            <TextField
              autoFocus
              margin="dense"
              id="name"
              value={dialogValue.type}
              onChange={(event) =>
                setDialogValue({
                  ...dialogValue,
                  type: event.target.value,
                })
              }
              label={t("_type")}
              type="text"
              variant="standard"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>{t("_Cancel")}</Button>
            <Button type="submit">{t("_Add")}</Button>
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
