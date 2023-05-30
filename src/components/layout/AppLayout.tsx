
import { Box, Toolbar } from '@mui/material';
import { NavBar, SideBar } from '..';
import { useCallback, useState } from 'react';

const drawerWidth = 240; //Ancho del sidebar en px;

export interface AppLayoutProps {
    children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {

    const [open, setOpen] = useState<boolean>(false);

    const handleSideBarOpen = useCallback(() => {
        setOpen(true);
    }, []);

    const handleSideBarClose = useCallback(() => {
        setOpen(false);
    }, []);


    return (
        <Box sx={{ display: 'flex' }}>
            {/* <CssBaseline /> */}
            <NavBar
                drawerWidth={drawerWidth}
                open={open}
                handleSideBarOpen={handleSideBarOpen} />

            <SideBar
                drawerWidth={drawerWidth}
                open={open}
                handleSideBarClose={handleSideBarClose} />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    backgroundColor: '#f4f4f4',
                    p: 3,
                    ml: `-${drawerWidth}px`,
                    ...(open && { ml: 0 })
                }}>
                <Toolbar />
                {children}
            </Box>
        </Box>
    );
}