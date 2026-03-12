import { Backdrop, CircularProgress } from '@mui/material';
import React from 'react';

export interface LoadingProps {
    loading: boolean;
}

export const Loading: React.FC<LoadingProps> = ({ loading }) => {
    return (
        <Backdrop
            sx={{ color: '#f4f4f4', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={loading}
        // onClick={handleClose}
        >
            <CircularProgress color="inherit" />
        </Backdrop>
    )
}
