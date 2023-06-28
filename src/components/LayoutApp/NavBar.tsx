import { AppBar, Grid, IconButton, Toolbar, Typography } from '@mui/material';
import { LogoutOutlined, MenuOutlined } from '@mui/icons-material';
import React from 'react';
import { NavBarProps } from '../../types';


export const NavBar: React.FC<NavBarProps> = ({ drawerWidth = 240, open, handleSideBarOpen }) => {

    const navigateTo = (path: string) => {
        window.location.replace(path);
    }

    return (
        <AppBar
            position='fixed'
            sx={{
                ...(open && {
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` }
                })
            }}
        >
            <Toolbar>
                <IconButton
                    color='inherit'
                    edge="start"
                    onClick={handleSideBarOpen}
                    sx={{ mr: 2, ...(open && { display: 'none' }) }} >
                    <MenuOutlined />
                </IconButton>

                <Grid
                    container
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center">
                    <Typography variant='h6' noWrap component="h2">FieldPartner</Typography>
                    <IconButton color='inherit' onClick={() => navigateTo('https://www.qtsagro.net/')}>
                        <LogoutOutlined />
                    </IconButton>
                </Grid>
            </Toolbar>
        </AppBar>
    )
}
