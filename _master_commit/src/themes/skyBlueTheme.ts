import { Theme, createTheme } from '@mui/material';

export const skyBlueTheme: Theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#15466f',
        },
        error: {
            main: '#ef5350',
        },
    },
    typography: {
        fontFamily: "Roboto, Arial"
    }
});