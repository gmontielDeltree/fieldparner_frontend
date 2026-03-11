import React, { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import { useTranslation } from "react-i18next";
import { Deposit } from "@types";
import { useAppSelector, useDeposit } from "../../../hooks";
import { dbContext } from "../../../services";
import { NotificationService } from "../../../services/notificationService";

const filter = createFilterOptions<DepositOptionType>();

interface DepositOptionType extends Partial<Deposit> {
  inputValue?: string;
}

interface AutocompleteDepositoProps {
  value: Deposit | null;
  onChange: (deposit: Deposit | null) => void;
  allowCreate?: boolean;
}

export const AutocompleteDeposito: React.FC<AutocompleteDepositoProps> = ({
  value,
  onChange,
  allowCreate = false,
}) => {
  const { t } = useTranslation();
  const { deposits, getDeposits, isLoading } = useDeposit();
  const { user } = useAppSelector((state) => state.auth);

  const [_value, setValue] = useState<DepositOptionType | null>(value || null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newDepositName, setNewDepositName] = useState("");

  useEffect(() => {
    getDeposits();
  }, []);

  // Sync internal state when parent value changes
  useEffect(() => {
    setValue(value || null);
  }, [value]);

  useEffect(() => {
    onChange(_value as Deposit | null);
  }, [_value]);

  return (
    <>
    <Autocomplete
      value={_value}
      loading={isLoading}
      onChange={(event, newValue) => {
        if (typeof newValue === "string") {
          if (allowCreate) {
            setNewDepositName(newValue);
            setOpenCreateDialog(true);
          } else {
            setValue({
              description: `${newValue}`,
            });
          }
        } else if (newValue && newValue.inputValue) {
          if (allowCreate) {
            setNewDepositName(newValue.inputValue);
            setOpenCreateDialog(true);
          } else {
            setValue({
              description: newValue.inputValue,
            });
          }
        } else {
          setValue(newValue);
        }
      }}
      filterOptions={(options, params) => {
        const filtered = filter(options, params);
        if (allowCreate && params.inputValue !== "") {
          filtered.push({
            inputValue: params.inputValue,
            description: `${t("_add")} "${params.inputValue}"`,
          });
        }
        return filtered;
      }}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      id="autocomplete-deposito"
      options={deposits}
      getOptionLabel={(option) => {
        if (typeof option === "string") {
          return option;
        }
        if (option.description) {
          return option.description;
        }
        return "";
      }}
      renderOption={(props, option) => (
        <li {...props} key={option._id || option.inputValue || option.description}>
          {option.description}
        </li>
      )}
      isOptionEqualToValue={(option, value) => {
        if (!option || !value) return false;
        return option._id === value._id || option.description === value.description;
      }}
      renderInput={(params) => (
        <TextField {...params} label={t("_warehouse")} />
      )}
    />
    <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)}>
      <DialogTitle>
        {t("_quick_add")} {t("_warehouse")}
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          fullWidth
          label={t("_warehouse")}
          value={newDepositName}
          onChange={(e) => setNewDepositName(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenCreateDialog(false)}>{t("cancel")}</Button>
        <Button
          onClick={async () => {
            try {
              if (!user) return;
              const description = (newDepositName || "").trim();
              if (!description) return;

              const doc: Partial<Deposit> = {
                accountId: user.accountId,
                description,
                owner: "Propio",
                isVirtual: false,
                geolocation: { lng: 0, lat: 0 },
                isNegative: false,
                address: "",
                zipCode: "",
                locality: "",
                province: "",
                country: user.countryId || "",
                locations: [],
              };

              const created = await dbContext.deposits.post(doc as Deposit);
              const createdDoc = await dbContext.deposits.get(created.id);
              await getDeposits();
              setValue(createdDoc as DepositOptionType);
              setOpenCreateDialog(false);
              setNewDepositName("");
              NotificationService.showAdded(createdDoc, t("deposit_label"));
            } catch (err) {
              NotificationService.showError(t("unexpectedError"), err, t("error_label"));
            }
          }}
        >
          {t("_add")}
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
};
