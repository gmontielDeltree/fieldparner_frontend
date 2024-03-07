import React, { useEffect, useState } from 'react'
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import { useTranslation } from 'react-i18next';
import { ContractorRepository } from '../../../classes/ContractorRepository';
import { Business } from '@types';

const filter = createFilterOptions<FilmOptionType>();

interface ContractorOptionType extends Business {
    inputValue?: string;
  }
  

export const AutocompleteContratista = ({value, onChange}) => {
    const [_value, setValue] = React.useState<ContractorOptionType | null>(value);
    const [open, toggleOpen] = React.useState(false);
    const { t } = useTranslation();

    const [contractorRepo, _] = useState(new ContractorRepository());
    const [contractors, setContractors] = useState<Business[]>([]);

    useEffect(() => {
      contractorRepo.getAll().then((cropsFromDB) => {
        console.log("Contractors", cropsFromDB)
        setContractors(cropsFromDB);
      });
  
      contractorRepo.attachObserver((cropsFromDB) => {
        // console.log("Settin Crops Again");
        setContractors(cropsFromDB);
      });
    }, []);

    const handleClose = () => {
      setDialogValue({
        razonSocial: '',
        cuit: ''
      });
      toggleOpen(false);
    };
  
    const [dialogValue, setDialogValue] = React.useState({
      razonSocial: '',
      cuit: ''
    });
  
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      // Save new contractor
      contractorRepo.add({
        nombreCompleto: dialogValue.razonSocial,
        razonSocial: dialogValue.razonSocial,
        cuit: dialogValue.cuit,
      }).then((doc)=>{
        setValue(doc)
      })

      handleClose();
    };

    useEffect(()=>{
      // console.log("_value",_value)
      onChange(_value)
    },[_value])
  
    return (
      <React.Fragment>
        <Autocomplete
          value={_value}
          onChange={(event, newValue) => {
            if (typeof newValue === 'string') {
              // timeout to avoid instant validation of the dialog's form.
              setTimeout(() => {
                toggleOpen(true);
                setDialogValue({
                  razonSocial: newValue,
                });
              });
            } else if (newValue && newValue.inputValue) {
              toggleOpen(true);
              setDialogValue({
                razonSocial: newValue.inputValue,
              });
            } else {
              setValue(newValue);
            }
          }}
          filterOptions={(options, params) => {
            const filtered = filter(options, params);
  
            if (params.inputValue !== '') {
              filtered.push({
                inputValue: params.inputValue,
                nombreCompleto: `${t("_add")} "${params.inputValue}"`,
                razonSocial: `${t("_add")} "${params.inputValue}"`,
              });
            }
  
            return filtered;
          }}
          id="free-solo-dialog-demo"
          options={contractors}
          getOptionLabel={(option) => {
            // e.g. value selected with enter, right from the input

            if (typeof option === 'string') {
              return option;
            }
            if (option.inputValue) {
              return option.inputValue;
            }

            return option?.nombreCompleto === "" ? option.razonSocial : option.nombreCompleto || "";
          }}
          selectOnFocus
          clearOnBlur
          handleHomeEndKeys
          renderOption={(props, option) => <li {...props}>{option?.nombreCompleto === "" ? option.razonSocial : option.nombreCompleto}</li>}
          sx={{ width: 300 }}
          freeSolo
          renderInput={(params) => <TextField {...params} label={t("_contractor")} />}
        />
        <Dialog open={open} onClose={handleClose}>
          <form onSubmit={handleSubmit}>
            <DialogTitle>{t("_quick_add")} {t("_contractor")}</DialogTitle>
            <DialogContent>
              <DialogContentText>
                {t("you_can_edit_more_details_later_in_the_contractors_menu_on_the_sidebar")}
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                id="name"
                value={dialogValue.razonSocial}
                onChange={(event) =>
                  setDialogValue({
                    ...dialogValue,
                    razonSocial: event.target.value,
                  })
                }
                label="Razón Social"
                type="text"
                variant="standard"
              />

              <TextField
                autoFocus
                margin="dense"
                id="name"
                value={dialogValue.cuit}
                onChange={(event) =>
                  setDialogValue({
                    ...dialogValue,
                    cuit: event.target.value,
                  })
                }
                label={t("_cuit")}
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
}

