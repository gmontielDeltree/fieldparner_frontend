
import { Box, Typography } from '@mui/material';
import React from 'react';
import { CloseButtonPage } from '../CloseButton';

interface TopbarCustomProps {
    mainTitle: string;
    iconTitle?: React.ReactNode;
    closeButton: boolean;
}

export const TopbarCustom: React.FC<TopbarCustomProps> = ({
    mainTitle,
    iconTitle,
    closeButton
}) => {
    return (
        <Box
            component="div"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{ ml: { sm: 2 }, pt: 2, pr: 2 }}
        >
            <Box display="flex" alignItems="center">
                {iconTitle}
                <Typography component="h2" variant="h4" sx={{ ml: { sm: 2 } }}>
                    {mainTitle}
                </Typography>
            </Box>
            {
                closeButton && <CloseButtonPage />
            }
        </Box>
    )
}
