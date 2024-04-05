import { Box, InputAdornment, TextField } from "@mui/material";
import { FC } from "react";
import SearchIcon from '@mui/icons-material/Search';

export const SearchBar : FC = ({onChange}) => {
    return <Box sx={{width:"100%"}}>
        <TextField sx={{width:"100%"}} onChange={onChange} variant="standard" InputProps={{
            startAdornment:  <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>,
          }}
          ></TextField>
    </Box>
}