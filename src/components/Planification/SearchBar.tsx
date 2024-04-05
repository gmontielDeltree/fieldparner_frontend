import { Box, InputAdornment, TextField } from "@mui/material";
import { FC } from "react";
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from "react-i18next";

export const SearchBar : FC = ({onChange}) => {
    const {t} = useTranslation()
    return <Box sx={{width:"100%"}}>
        <TextField sx={{width:"100%"}} onChange={onChange} variant="standard" placeholder={t("buscar campo")} InputProps={{
            startAdornment:  <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>,
          }}
          ></TextField>
    </Box>
}